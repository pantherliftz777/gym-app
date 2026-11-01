/**
 * FitFuel Exercise Equipment & Location Filtering Engine
 * Modular equipment-aware and location-aware workout filtering system
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FitFuelExerciseEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const HOME_EQUIPMENT = [
    'Bodyweight',
    'Dumbbells',
    'Resistance Bands',
    'Bench',
    'Pull-up Bar',
    'Kettlebells',
    'Skipping Rope',
    'Exercise Mat',
    'Chair'
  ];

  const GYM_EQUIPMENT = [
    'Bodyweight',
    'Dumbbells',
    'Barbells',
    'Weight Machines',
    'Cable Machines',
    'Smith Machine',
    'Bench',
    'Pull-up Bar',
    'Kettlebells',
    'Treadmill',
    'Stationary Bike',
    'Elliptical'
  ];

  const ALL_EQUIPMENT = Array.from(new Set([...HOME_EQUIPMENT, ...GYM_EQUIPMENT]));

  /**
   * Resolves canonical muscle group ('Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body')
   */
  function resolveExerciseMuscleGroup(ex) {
    if (!ex) return 'Full Body';
    // If already normalized to standard 7 groups
    if (ex.category && ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'].includes(ex.category)) {
      return ex.category;
    }
    const m = (ex.muscle || '').toLowerCase();
    const cat = (ex.category || '').toLowerCase();
    const name = (ex.name || '').toLowerCase();

    if (m.includes('chest') || m.includes('pectoral') || cat === 'chest' || name.includes('push-up') || name.includes('bench press')) {
      return 'Chest';
    }
    if (m.includes('back') || m.includes('lat') || m.includes('trap') || cat === 'back' || name.includes('pull-up') || name.includes('row')) {
      return 'Back';
    }
    if (m.includes('shoulder') || m.includes('delt') || cat === 'shoulders') {
      return 'Shoulders';
    }
    if (m.includes('bicep') || m.includes('tricep') || m.includes('forearm') || cat.includes('arm')) {
      return 'Arms';
    }
    if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('adductor') || cat.includes('leg')) {
      return 'Legs';
    }
    if (m.includes('abs') || m.includes('oblique') || m.includes('core') || cat === 'waist') {
      return 'Core';
    }
    return 'Full Body';
  }

  /**
   * Resolves canonical equipment, compatible locations, workout types, and alternatives for an exercise.
   */
  function resolveExerciseMetadata(ex) {
    if (!ex) return null;
    const name = (ex.name || '').toLowerCase();
    const rawEq = (ex.equipment || ex.type || '').toLowerCase();
    const instr = (ex.instructions_en || ex.steps || '').toLowerCase();
    const cat = (ex.category || '').toLowerCase();
    const sub = (ex.sub || '').toLowerCase();

    const needed = new Set();

    // 1. Determine apparatus & equipment dependencies
    if (rawEq === 'body weight' || rawEq.includes('body') || rawEq.includes('none')) {
      needed.add('Bodyweight');
      if (name.includes('pull-up') || name.includes('chin-up') || name.includes('pullup') || name.includes('chinup')) {
        needed.add('Pull-up Bar');
      } else if (name.includes('bench dip') || (name.includes('dip') && !name.includes('shrug') && instr.includes('bench'))) {
        needed.add('Bench');
      } else if (name.includes('chair') || instr.includes('chair')) {
        needed.add('Chair');
      } else if (name.includes('jump rope') || name.includes('skipping')) {
        needed.add('Skipping Rope');
      } else if (name.includes('box jump') || name.includes('step-up')) {
        needed.add('Bench');
      }
    } else if (rawEq.includes('dumbbell')) {
      needed.add('Dumbbells');
      if (name.includes('bench') || name.includes('incline') || name.includes('decline') || 
          name.includes('lying') || name.includes('fly') || name.includes('preacher') || name.includes('chest press')) {
        needed.add('Bench');
      }
    } else if (rawEq.includes('barbell') || rawEq.includes('ez') || rawEq.includes('trap bar') || rawEq.includes('olympic')) {
      needed.add('Barbells');
      if (name.includes('bench') || name.includes('incline') || name.includes('decline') || 
          name.includes('lying') || name.includes('chest press')) {
        needed.add('Bench');
      }
    } else if (rawEq.includes('cable')) {
      needed.add('Cable Machines');
      if (name.includes('bench') || (name.includes('seated') && instr.includes('bench'))) {
        needed.add('Bench');
      }
    } else if (rawEq.includes('smith')) {
      needed.add('Smith Machine');
      if (name.includes('bench') || name.includes('incline') || name.includes('decline')) {
        needed.add('Bench');
      }
    } else if (rawEq.includes('band') || rawEq.includes('resistance band')) {
      needed.add('Resistance Bands');
    } else if (rawEq.includes('kettlebell')) {
      needed.add('Kettlebells');
    } else if (rawEq.includes('treadmill') || name.includes('treadmill')) {
      needed.add('Treadmill');
    } else if (rawEq.includes('bike') || name.includes('cycle') || name.includes('stationary bike')) {
      needed.add('Stationary Bike');
    } else if (rawEq.includes('elliptical') || name.includes('elliptical')) {
      needed.add('Elliptical');
    } else if (rawEq.includes('rope')) {
      if (name.includes('jump') || name.includes('skipping')) {
        needed.add('Skipping Rope');
      } else {
        needed.add('Weight Machines'); // Conditioning ropes / machines
      }
    } else if (rawEq.includes('machine') || rawEq.includes('leverage') || rawEq.includes('sled') || 
               rawEq.includes('skierg') || rawEq.includes('ergometer')) {
      needed.add('Weight Machines');
    } else {
      needed.add('Bodyweight');
    }

    const requiredList = Array.from(needed);

    // 2. Compatible Locations
    const homeAvailable = new Set(HOME_EQUIPMENT);
    const gymAvailable = new Set(GYM_EQUIPMENT);

    const canHome = requiredList.every(eq => homeAvailable.has(eq));
    const canGym = requiredList.every(eq => gymAvailable.has(eq));

    const compatibleLocations = [];
    if (canHome) compatibleLocations.push('home');
    if (canGym) compatibleLocations.push('gym');
    if (compatibleLocations.length === 0) compatibleLocations.push('gym');

    // 3. Workout Types
    const workoutTypes = [];
    const isHiit = name.includes('jump') || name.includes('burpee') || name.includes('hop') || 
                   name.includes('jack') || name.includes('climber') || name.includes('sprint') || 
                   name.includes('hiit') || name.includes('high knee') || sub.includes('plyo') || 
                   name.includes('box jump') || name.includes('skater') || name.includes('kettlebell swing');
    
    const isCardio = cat === 'cardio' || (ex.muscle || '').includes('cardio') || name.includes('run') || 
                     name.includes('cycle') || name.includes('bike') || name.includes('rope') || 
                     name.includes('skip') || name.includes('treadmill') || name.includes('rowing') || 
                     name.includes('jack') || name.includes('burpee') || name.includes('climber') || 
                     name.includes('sprint') || name.includes('jog') || name.includes('elliptical') || 
                     name.includes('aerobic');

    const isStretching = name.includes('stretch') || name.includes('plank') || name.includes('twist') || 
                         name.includes('mobility') || name.includes('roll') || name.includes('reach') || 
                         name.includes('bridge') || sub.includes('mobility') || sub.includes('flexibility') ||
                         name.includes('cat-cow') || name.includes('child pose') || name.includes('cobra');

    if (isHiit) workoutTypes.push('hiit');
    if (isCardio) workoutTypes.push('cardio');
    if (isStretching) workoutTypes.push('stretching');
    
    const isBodyweightStretchingOnly = (isStretching && !isHiit && !isCardio && 
      !name.includes('press') && !name.includes('squat') && !name.includes('push-up') && !name.includes('pull') && !name.includes('curl'));
    if (!isBodyweightStretchingOnly) {
      workoutTypes.push('strength');
    }

    // 4. Smart Alternatives
    const alternatives = [];
    if (name.includes('bench press') || name.includes('chest press machine')) {
      alternatives.push('Push-ups', 'Dumbbell Floor Press');
    } else if (name.includes('lat pulldown') || name.includes('cable pulldown')) {
      alternatives.push('Resistance Band Rows', 'Pull-ups', 'Inverted Rows');
    } else if (name.includes('leg extension')) {
      alternatives.push('Bodyweight Sissy Squats', 'Goblet Squats');
    } else if (name.includes('leg press')) {
      alternatives.push('Bulgarian Split Squats', 'Goblet Squats', 'Bodyweight Squats');
    } else if (name.includes('bicep curl')) {
      alternatives.push('Resistance Band Bicep Curls', 'Chin-ups');
    } else if (name.includes('tricep pushdown') || name.includes('cable tricep')) {
      alternatives.push('Diamond Push-ups', 'Bench Dips');
    } else if (name.includes('treadmill') || name.includes('running')) {
      alternatives.push('High Knees', 'Jumping Rope', 'Burpees');
    }

    const muscleGroup = resolveExerciseMuscleGroup(ex);

    return {
      canonicalEquipment: requiredList,
      compatibleLocations,
      workoutTypes,
      muscleGroup,
      alternatives
    };
  }

  /**
   * Filter exercise against active filter criteria
   */
  function matchesFilter(ex, criteria) {
    if (!ex) return false;
    const meta = ex._filterMeta || resolveExerciseMetadata(ex);
    ex._filterMeta = meta;

    // Search query
    if (criteria.query) {
      const q = criteria.query.toLowerCase().trim();
      const name = (ex.name || '').toLowerCase();
      const sub = (ex.sub || '').toLowerCase();
      const cat = (ex.category || '').toLowerCase();
      const eq = (ex.equipment || ex.type || '').toLowerCase();
      if (!name.includes(q) && !sub.includes(q) && !cat.includes(q) && !eq.includes(q)) {
        return false;
      }
    }

    // 1. Location Filter ('all', 'home', 'gym')
    if (criteria.location && criteria.location !== 'all') {
      if (!meta.compatibleLocations.includes(criteria.location)) {
        return false;
      }
    }

    // 2. Workout Type Filter (Set of active types or 'all')
    if (criteria.workoutTypes && criteria.workoutTypes.size > 0 && !criteria.workoutTypes.has('all')) {
      let matchesAnyType = false;
      for (const t of criteria.workoutTypes) {
        if (meta.workoutTypes.includes(t)) {
          matchesAnyType = true;
          break;
        }
      }
      if (!matchesAnyType) return false;
    }

    // 3. Equipment Availability Filter (Strict matching)
    if (criteria.selectedEquipment && criteria.selectedEquipment.size > 0) {
      for (const eqItem of meta.canonicalEquipment) {
        if (!criteria.selectedEquipment.has(eqItem)) {
          return false;
        }
      }
    }

    // 4. Muscle Group Filter
    if (criteria.muscleGroup) {
      const targetCat = criteria.muscleGroup;
      if (meta.muscleGroup !== targetCat) {
        // Allow cardio to match Full Body
        if (!(targetCat === 'Full Body' && meta.workoutTypes.includes('cardio'))) {
          return false;
        }
      }
    }

    // 5. Sub-Muscle Group Filter
    if (criteria.subMuscle && !criteria.subMuscle.startsWith('All ')) {
      const subL = criteria.subMuscle.toLowerCase();
      const exSub = (ex.sub || ex.muscle || '').toLowerCase();
      const exName = (ex.name || '').toLowerCase();
      const exType = (ex.type || ex.equipment || '').toLowerCase();

      if (subL.includes('quad')) {
        if (!exSub.includes('quad') && !exName.includes('squat') && !exName.includes('leg extension') && !exName.includes('lunge')) return false;
      } else if (subL.includes('hamstring')) {
        if (!exSub.includes('hamstring') && !exName.includes('curl') && !exName.includes('deadlift') && !exName.includes('rdl')) return false;
      } else if (subL.includes('glute')) {
        if (!exSub.includes('glute') && !exName.includes('hip thrust') && !exName.includes('bridge') && !exName.includes('kickback')) return false;
      } else if (subL.includes('calf') || subL.includes('calves')) {
        if (!exSub.includes('calf') && !exSub.includes('calves') && !exName.includes('calf')) return false;
      } else if (subL.includes('upper chest')) {
        if (!exSub.includes('upper') && !exName.includes('incline')) return false;
      } else if (subL.includes('lower chest')) {
        if (!exSub.includes('lower') && !exName.includes('decline') && !exName.includes('dip')) return false;
      } else if (subL.includes('mid chest')) {
        if (!exSub.includes('mid') && !exName.includes('flat') && !exName.includes('bench press') && !exName.includes('push-up')) return false;
      } else if (subL.includes('lat')) {
        if (!exSub.includes('lat') && !exName.includes('pull') && !exName.includes('row')) return false;
      } else if (subL.includes('bicep')) {
        if (!exSub.includes('bicep') && !exName.includes('curl') && !exName.includes('chin-up')) return false;
      } else if (subL.includes('tricep')) {
        if (!exSub.includes('tricep') && !exName.includes('extension') && !exName.includes('pushdown') && !exName.includes('dip')) return false;
      } else if (subL.includes('forearm')) {
        if (!exSub.includes('forearm') && !exName.includes('wrist')) return false;
      } else if (subL.includes('bodyweight')) {
        if (!meta.canonicalEquipment.includes('Bodyweight') || meta.canonicalEquipment.length > 1) return false;
      } else if (subL.includes('machine') || subL.includes('gear')) {
        if (!meta.canonicalEquipment.includes('Weight Machines') && !meta.canonicalEquipment.includes('Cable Machines')) return false;
      } else if (subL.includes('compound')) {
        if (!exName.includes('squat') && !exName.includes('deadlift') && !exName.includes('press') && 
            !exName.includes('row') && !exName.includes('pull-up') && !exName.includes('lunge')) {
          return false;
        }
      } else if (subL.includes('conditioning')) {
        if (!meta.workoutTypes.includes('cardio') && !meta.workoutTypes.includes('hiit')) return false;
      } else {
        if (!exSub.includes(subL) && !exName.includes(subL)) {
          return false;
        }
      }
    }

    return true;
  }

  return {
    HOME_EQUIPMENT,
    GYM_EQUIPMENT,
    ALL_EQUIPMENT,
    resolveExerciseMuscleGroup,
    resolveExerciseMetadata,
    matchesFilter
  };
});
