(function(){
  const EX_ANIM_MAP = {
    'incline dumbbell bench press':'incline-dumbbell-press','incline barbell bench press':'incline-bench-press','low-to-high cable fly':'cable-fly','incline push-up':'push-up','flat barbell bench press':'bench-press','flat dumbbell press':'dumbbell-bench-press','dumbbell floor press':'dumbbell-bench-press','push-up':'push-up','bench press':'bench-press','dumbbell bench press':'dumbbell-bench-press','incline dumbbell press':'incline-dumbbell-press','cable fly':'cable-fly','pec deck':'pec-deck','chest dip':'chest-dip','dip':'dip',
    'deadlift':'deadlift','rdl':'romanian-deadlift','romanian deadlift':'romanian-deadlift','conventional deadlift':'deadlift','sumo deadlift':'sumo-deadlift','trap bar deadlift':'trap-bar-deadlift','barbell row':'barbell-row','bent over row':'barbell-row','dumbbell bent over row':'dumbbell-bent-over-row','one arm dumbbell row':'one-arm-dumbbell-row','chest supported row':'chest-supported-row','seated cable row':'seated-row','seated row':'seated-row','cable row':'seated-row','lat pulldown':'lat-pulldown','wide grip lat pulldown':'wide-grip-lat-pulldown','close grip lat pulldown':'close-grip-lat-pulldown','straight arm pulldown':'straight-arm-pulldown','pull up':'pull-up','pull-up':'pull-up','chin up':'chin-up','chin-up':'chin-up','assisted pull up':'assisted-pull-up','face pull':'face-pull','rear delt fly':'rear-delt-fly','shrug':'shrug','barbell shrug':'shrug','upright row':'upright-row','pendlay row':'pendlay-row','inverted row':'inverted-row','back extension':'back-extension','good morning':'good-morning','rack pull':'rack-pull',
    'squat':'squat','barbell back squat':'squat','front squat':'front-squat','goblet squat':'goblet-squat','bulgarian split squat':'bulgarian-split-squat','split squat':'split-squat','reverse lunge':'reverse-lunge','walking lunge':'walking-lunge','forward lunge':'forward-lunge','lateral lunge':'lateral-lunge','curtsy lunge':'curtsy-lunge','step up':'step-up','leg press':'leg-press','hack squat':'hack-squat','leg extension':'leg-extension','leg curl':'leg-curl','seated leg curl':'seated-leg-curl','lying leg curl':'lying-leg-curl','hip thrust':'hip-thrust','glute bridge':'glute-bridge','single leg glute bridge':'single-leg-glute-bridge','barbell glute bridge':'barbell-glute-bridge','dumbbell hip thrust':'dumbbell-hip-thrust','standing calf raise':'standing-calf-raise','seated calf raise':'seated-calf-raise','calf raise':'calf-raise','donkey calf raise':'donkey-calf-raise','nordic hamstring curl':'nordic-hamstring-curl',
    'overhead press':'overhead-press','barbell overhead press':'overhead-press','seated dumbbell press':'seated-dumbbell-press','standing dumbbell press':'standing-dumbbell-press','arnold press':'arnold-press','lateral raise':'lateral-raise','cable lateral raise':'cable-lateral-raise','front raise':'front-raise','rear delt fly':'rear-delt-fly','reverse pec deck':'reverse-pec-deck','machine shoulder press':'machine-shoulder-press','push press':'push-press',
    'bicep curl':'bicep-curl','dumbbell bicep curl':'bicep-curl','hammer curl':'hammer-curl','incline dumbbell curl':'incline-dumbbell-curl','concentration curl':'concentration-curl','preacher curl':'preacher-curl','cable curl':'cable-curl','ez bar curl':'ez-bar-curl','spider curl':'spider-curl','rope hammer curl':'rope-hammer-curl','tricep pushdown':'tricep-pushdown','rope tricep pushdown':'rope-tricep-pushdown','overhead tricep extension':'overhead-tricep-extension','skull crusher':'skull-crusher','dumbbell skull crusher':'dumbbell-skull-crusher','dumbbell overhead tricep extension':'dumbbell-overhead-tricep-extension','tricep kickback':'tricep-kickback','close grip bench press':'close-grip-bench-press','bench dip':'bench-dip','chair dip':'chair-dip',
    'plank':'plank','side plank':'side-plank','crunch':'crunch','reverse crunch':'reverse-crunch','bicycle crunch':'crunch','leg raise':'lying-leg-raise','lying leg raise':'lying-leg-raise','hanging leg raise':'hanging-leg-raise','cable crunch':'cable-crunch','ab wheel':'ab-wheel','ab wheel rollout':'ab-wheel','dead bug':'banded-dead-bug','bird dog':'crunch','russian twist':'crunch','mountain climber':'crunch','v-up':'v-up','toe touch':'toe-touch','flutter kick':'flutter-kick','plank shoulder tap':'plank-shoulder-tap','plank jack':'plank-jack','hollow body hold':'hollow-body-hold','dragon flag':'dragon-flag',
    'running':'running','walking':'walking','cycling':'cycling','rowing':'rowing','jump rope':'jump-rope','burpee':'burpee','jumping jack':'jumping-jack','high knees':'high-knees','skater hop':'skater-hop','inchworm':'inchworm','bear crawl':'bear-crawl','farmer carry':'farmer-carry','kettlebell swing':'kettlebell-swing','battle ropes':'battle-ropes','stair climber':'stair-climber','assault bike':'assault-bike',
    'cat cow stretch':'cat-cow-stretch','childs pose':'childs-pose','hamstring stretch':'hamstring-stretch','standing quad stretch':'standing-quad-stretch','worlds greatest stretch':'worlds-greatest-stretch','arm circles':'arm-circles','leg swings':'leg-swings-stretch','doorway chest stretch':'doorway-chest-stretch','wall calf stretch':'wall-calf-stretch','butterfly stretch':'butterfly-stretch','cross body shoulder stretch':'cross-body-shoulder-stretch','kneeling hip flexor stretch':'kneeling-hip-flexor-stretch','seated forward fold':'seated-forward-fold-stretch','torso twists':'torso-twist-stretch'
  };
  function slugForExercise(ex) {
    if (!ex) return null;
    const name = String(ex.name || '').trim();
    if (!name) return null;
    const key = name.toLowerCase();
    if (EX_ANIM_MAP[key]) return EX_ANIM_MAP[key];
    for (const [k, v] of Object.entries(EX_ANIM_MAP)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || null;
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

  function animationHtml(slug, exerciseName) {
    if (!slug) {
      return '<div class="exercise-anim-fallback"><div style="font-size:2rem;margin-bottom:8px;">&#128736;</div><div>No human-body animation available for<br><b>'+escapeHtml(exerciseName||'Exercise')+'</b></div><div style="font-size:.7rem;margin-top:6px;opacity:.7;">Enable "Smart Start" view for technique guidance.</div></div>';
    }
    const base = 'exercise-animations/' + slug;
    return '<div class="exercise-anim-wrap" id="exAnimWrap"><div class="exercise-anim-stage" id="exAnimStage"><img src="'+base+'/frame-1.svg" class="ex-anim-frame" alt="Frame 1"><img src="'+base+'/frame-2.svg" class="ex-anim-frame" alt="Frame 2"><img src="'+base+'/frame-3.svg" class="ex-anim-frame" alt="Frame 3"></div><div class="exercise-anim-controls"><button type="button" class="exercise-anim-btn" id="exAnimPlay" title="Play/Pause animation">&#9658;</button></div><div class="exercise-anim-label">HUMAN-BODY FORM GUIDE &#183; '+escapeHtml(exerciseName||'Exercise')+'</div></div>';
  }

  window.FF_EX_ANIM = {
    slugForExercise: slugForExercise,
    animationHtml: animationHtml,
    init: function(containerId, slug, exerciseName) {
      const container = document.getElementById(containerId);
      if (!container) return false;
      container.innerHTML = animationHtml(slug, exerciseName);
      const btn = document.getElementById('exAnimPlay');
      const wrap = document.getElementById('exAnimWrap');
      let paused = false;
      if (btn && wrap) {
        btn.onclick = () => {
          paused = !paused;
          if (paused) { wrap.classList.add('exercise-anim-paused'); btn.textContent = '&#10074;&#10074;'; btn.classList.add('paused'); }
          else { wrap.classList.remove('exercise-anim-paused'); btn.textContent = '&#9658;'; btn.classList.remove('paused'); }
        };
      }
      return true;
    }
  };
})();

