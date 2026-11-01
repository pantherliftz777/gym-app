/* FitFuel Beta Features & Access Management Engine
   Centralized feature flags and role-based permissions
*/
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'beta-features.json');

// The 6 Canonical Beta Features
const DEFAULT_FEATURES = [
  {
    key: 'posture',
    name: 'Posture AI / Posture Camera',
    description: 'Computer vision posture tracking, skeletal alignment, and real-time exercise rep counting via device camera.',
    access_level: 'admin_only', // Safe default: experimental feature disabled for regular users
    views: ['posture'],
    category: 'Motion & Biomechanics'
  },
  {
    key: 'body-analysis',
    name: 'Body Analysis / Body Scan',
    description: '4-View photographic body scan, ISO 8559-1 circumferences, Ramanujan elliptical tape model, and U.S. Navy Hodgdon-Beckett body composition.',
    access_level: 'admin_only', // Safe default: experimental feature disabled for regular users
    views: ['body-analysis'],
    category: 'Body Composition'
  },
  {
    key: 'food-scanner',
    name: 'Food Photo Scan',
    description: 'AI visual plate and food photo recognition for automated macronutrient auditing and meal logging.',
    access_level: 'beta_testers', // Safe default: accessible only to authorized beta testers and admins
    views: [],
    category: 'Nutrition Vision'
  },
  {
    key: 'voice-coach',
    name: 'Voice Mode',
    description: 'Live bidirectional interactive speech guidance, voice coaching, and audio rep prompts.',
    access_level: 'admin_only', // Safe default: experimental feature disabled for regular users
    views: [],
    category: 'Audio & Speech'
  },
  {
    key: 'gps-activity',
    name: 'GPS Activity Tracking',
    description: 'Real-time outdoor GPS walk/run mapping, live split pace HUD, and elevation telemetry.',
    access_level: 'beta_testers', // Safe default: accessible only to authorized beta testers and admins
    views: ['activity'],
    category: 'Sensors & GPS'
  },
  {
    key: 'barcode-scanner',
    name: 'Barcode Scanner',
    description: 'Instant camera barcode lookup for food products and grocery items via OpenFoodFacts.',
    access_level: 'beta_testers', // Safe default: accessible only to authorized beta testers and admins
    views: [],
    category: 'Nutrition Data'
  }
];

const VALID_ACCESS_LEVELS = ['disabled', 'admin_only', 'beta_testers', 'all_users'];

class BetaFeatureManager {
  constructor() {
    this.db = null;
    this.memoryFlags = new Map();
    this._loadFromFile();
  }

  _loadFromFile() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach(f => {
            if (f && f.key) this.memoryFlags.set(f.key, f);
          });
        }
      }
    } catch (err) {
      console.warn('[BetaFeatures] Error reading config file:', err.message);
    }

    // Ensure all default features exist
    DEFAULT_FEATURES.forEach(df => {
      if (!this.memoryFlags.has(df.key)) {
        this.memoryFlags.set(df.key, { ...df, updated_at: Date.now(), updated_by: 'system' });
      } else {
        // Merge metadata
        const existing = this.memoryFlags.get(df.key);
        this.memoryFlags.set(df.key, {
          ...df,
          ...existing,
          views: df.views,
          category: df.category
        });
      }
    });
  }

  _saveToFile() {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      const list = Array.from(this.memoryFlags.values());
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[BetaFeatures] Error writing config file:', err.message);
    }
  }

  async init(dbInstance) {
    this.db = dbInstance;

    // 1. Ensure `is_beta_tester` column exists on users table
    try {
      await this.db.run('ALTER TABLE users ADD COLUMN is_beta_tester INTEGER DEFAULT 0');
    } catch (e) {
      // Column may already exist
    }

    // 2. Ensure feature_flags table exists
    try {
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS feature_flags (
          key TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          access_level TEXT NOT NULL DEFAULT 'beta_testers',
          updated_at INTEGER,
          updated_by TEXT
        )
      `);

      // Seed / sync from memory to DB
      for (const [key, feat] of this.memoryFlags.entries()) {
        const existing = await this.db.get('SELECT * FROM feature_flags WHERE key = ?', [key]);
        if (!existing) {
          await this.db.run(
            'INSERT INTO feature_flags(key, name, description, access_level, updated_at, updated_by) VALUES(?,?,?,?,?,?)',
            [key, feat.name, feat.description, feat.access_level, feat.updated_at || Date.now(), feat.updated_by || 'system']
          );
        } else {
          // Keep database state as authoritative
          this.memoryFlags.set(key, {
            ...feat,
            access_level: existing.access_level,
            updated_at: existing.updated_at,
            updated_by: existing.updated_by
          });
        }
      }
      this._saveToFile();
    } catch (err) {
      console.warn('[BetaFeatures] DB table init warning:', err.message);
    }
  }

  getAllFlags() {
    return Array.from(this.memoryFlags.values());
  }

  getFlag(key) {
    return this.memoryFlags.get(key) || null;
  }

  async updateFlag(key, accessLevel, adminUser = null) {
    if (!this.memoryFlags.has(key)) {
      throw new Error(`Unknown beta feature key: "${key}"`);
    }
    if (!VALID_ACCESS_LEVELS.includes(accessLevel)) {
      throw new Error(`Invalid access_level "${accessLevel}". Must be one of: ${VALID_ACCESS_LEVELS.join(', ')}`);
    }

    const feat = this.memoryFlags.get(key);
    feat.access_level = accessLevel;
    feat.updated_at = Date.now();
    feat.updated_by = adminUser ? (adminUser.email || adminUser.name || 'admin') : 'admin';

    this.memoryFlags.set(key, feat);
    this._saveToFile();

    if (this.db) {
      await this.db.run(
        'INSERT INTO feature_flags(key, name, description, access_level, updated_at, updated_by) VALUES(?,?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET access_level=excluded.access_level, updated_at=excluded.updated_at, updated_by=excluded.updated_by',
        [key, feat.name, feat.description, feat.access_level, feat.updated_at, feat.updated_by]
      );
    }

    return feat;
  }

  /**
   * Determine whether a user can access a feature.
   * Access levels:
   *   - 'disabled': false for everyone
   *   - 'admin_only': true if user is admin
   *   - 'beta_testers': true if user is admin or is_beta_tester === 1
   *   - 'all_users': true for everyone (including guests / regular users)
   */
  isFeatureAccessible(key, user = null) {
    const feat = this.memoryFlags.get(key);
    if (!feat) return false;

    const level = feat.access_level;
    if (level === 'disabled') return false;

    const isAdmin = Boolean(user && (user.is_admin === 1 || user.email === 'admin@fitfuel.app'));
    if (isAdmin) return true;

    if (level === 'admin_only') return false;

    const isTester = Boolean(user && (user.is_beta_tester === 1 || isAdmin));
    if (level === 'beta_testers') return isTester;

    if (level === 'all_users') return true;

    return false;
  }

  /**
   * Builds the feature visibility map for a specific user (or guest).
   */
  getUserFeatures(user = null) {
    const isAdmin = Boolean(user && (user.is_admin === 1 || user.email === 'admin@fitfuel.app'));
    const isTester = Boolean(user && (user.is_beta_tester === 1 || isAdmin));

    let userRole = 'guest';
    if (isAdmin) userRole = 'admin';
    else if (isTester) userRole = 'beta_tester';
    else if (user && user.id) userRole = 'user';

    const result = {};
    for (const [key, feat] of this.memoryFlags.entries()) {
      const enabled = this.isFeatureAccessible(key, user);
      result[key] = {
        key: feat.key,
        name: feat.name,
        description: feat.description,
        access_level: feat.access_level,
        category: feat.category,
        views: feat.views || [],
        enabled: enabled,
        is_beta: feat.access_level !== 'all_users'
      };
    }

    return {
      userRole,
      isAdmin,
      isTester,
      features: result
    };
  }
}

module.exports = new BetaFeatureManager();
