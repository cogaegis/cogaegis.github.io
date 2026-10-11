/* ==========================================================================
   CogAegis AI Detector — brain meter
   CogBrain.svg(pct)   -> SVG markup for a 0–100 AI-likelihood score
   CogBrain.stage(pct) -> { key, name } for the score's label
   ========================================================================== */
(function () {
  'use strict';

  var STAGES = [
    { key: 'organic',   max: 10,  name: 'Certified Organic Product' },
    { key: 'enhanced',  max: 25,  name: 'Enhanced Organic Product' },
    { key: 'modified',  max: 50,  name: 'Artificially Modified Product' },
    { key: 'generated', max: 75,  name: 'Artificially Generated Product' },
    { key: 'slop',      max: 100, name: 'AI Slop' }
  ];

  var BRAIN = 'M100 26 C88 12 62 14 56 30 C38 28 24 42 28 60 C14 68 12 92 26 102 C20 120 34 138 54 136 C62 150 84 152 96 142 L104 142 C116 152 138 150 146 136 C166 138 180 120 174 102 C188 92 186 68 172 60 C176 42 162 28 144 30 C138 14 112 12 100 26 Z';
  var ROBOT = 'M100 22 L56 24 L32 42 L22 74 L26 108 L42 132 L70 146 L130 146 L158 132 L174 108 L178 74 L168 42 L144 24 Z';
  var uid = 0;

  function stage(pct) {
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    for (var i = 0; i < STAGES.length; i++) { if (p <= STAGES[i].max) return STAGES[i]; }
    return STAGES[STAGES.length - 1];
  }

  function gyri(stroke) {
    return '<g fill="none" stroke="' + stroke + '" stroke-width="3.5" stroke-linecap="round">' +
      '<path d="M100 30 C96 38 104 44 100 52"/><path d="M50 54 C58 46 70 48 72 58"/>' +
      '<path d="M30 82 C38 76 48 80 48 88"/><path d="M170 82 C162 76 152 80 152 88"/>' +
      '<path d="M62 132 C68 124 78 126 80 134"/><path d="M138 132 C132 124 122 126 120 134"/></g>';
  }

  function cuteEyes() {
    return '<circle cx="76" cy="90" r="17" fill="#1A1414"/><circle cx="124" cy="90" r="17" fill="#1A1414"/>' +
      '<circle cx="82" cy="83" r="6.5" fill="#fff"/><circle cx="130" cy="83" r="6.5" fill="#fff"/>' +
      '<circle cx="70" cy="97" r="3" fill="#fff"/><circle cx="118" cy="97" r="3" fill="#fff"/>';
  }

  function chip(modified) {
    var s = '<g transform="translate(4 -8)"><circle cx="150" cy="60" r="18" fill="#E0707F" opacity="0.35"/>' +
      '<g fill="none" stroke="#7B5C95" stroke-width="2.5" stroke-linecap="round">' +
      '<path d="M139 58 q-8 -2 -12 4 q-4 6 -10 4"/><path d="M160 72 q4 8 0 14"/><path d="M164 52 q8 -2 8 -10"/></g>';
    if (modified) {
      s += '<g fill="none" stroke="#6A4C84" stroke-width="2.5" stroke-linecap="round">' +
        '<path d="M144 48 q-6 -10 -16 -10"/><path d="M164 70 q10 4 12 14"/><path d="M128 50 q-10 -2 -14 -10"/></g>';
    }
    s += '<g stroke="#D9A93A" stroke-width="2" stroke-linecap="round">' +
      '<path d="M144 49 v-4"/><path d="M150 49 v-4"/><path d="M156 49 v-4"/>' +
      '<path d="M144 71 v4"/><path d="M150 71 v4"/><path d="M156 71 v4"/>' +
      '<path d="M139 54 h-4"/><path d="M139 60 h-4"/><path d="M139 66 h-4"/>' +
      '<path d="M161 54 h4"/><path d="M161 60 h4"/><path d="M161 66 h4"/></g>' +
      '<rect x="139" y="49" width="22" height="22" rx="3" fill="#2B323C" stroke="#12161B" stroke-width="2"/>' +
      '<rect x="144" y="54" width="12" height="12" rx="1.5" fill="#4A5563"/>' +
      '<circle class="cb-blink" cx="157" cy="52.5" r="1.6" fill="#4CE0A0"/></g>';
    return s;
  }

  function fleshy(key, id) {
    var c = {
      organic:  { fill: '#FFB6C8', stroke: '#B85A73', shine: 0.7,  blush: 0.65 },
      enhanced: { fill: '#EDB3BE', stroke: '#A45E6D', shine: 0.45, blush: 0.4 },
      modified: { fill: '#D9B2BB', stroke: '#8A6470', shine: 0.2,  blush: 0 }
    }[key];
    var mod = key === 'modified';
    var s = '';
    if (key === 'organic') {
      s += '<g fill="#FFC94D"><path class="cb-tw" d="M10 10 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z"/>' +
        '<path class="cb-tw2" d="M188 120 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 z"/>' +
        '<path class="cb-tw2" d="M182 4 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z"/></g>';
    }
    s += '<g class="cb-bob">';
    if (mod) {
      s += '<path d="M70 24 L62 0" stroke="#3A4250" stroke-width="3" stroke-linecap="round"/>' +
        '<circle class="cb-blink" cx="61" cy="-3" r="5" fill="#FF5A5A"/>';
    }
    s += '<path d="' + BRAIN + '" fill="' + c.fill + '" stroke="' + c.stroke + '" stroke-width="4" stroke-linejoin="round"/>';
    if (key !== 'organic') {
      s += '<g clip-path="url(#' + id + '-brain)">' +
        '<circle cx="154" cy="52" r="' + (mod ? 62 : 30) + '" fill="#9C7FA0" opacity="' + (mod ? 0.45 : 0.18) + '"/>' +
        (mod ? '<circle cx="154" cy="52" r="38" fill="#8A6C92" opacity="0.45"/>' : '') + '</g>';
    }
    s += '<path d="M62 40 C70 32 84 32 90 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="' + c.shine + '"/>';
    s += gyri(c.stroke);
    if (key !== 'organic') s += chip(mod);
    if (mod) {
      s += '<path d="M143 50 C124 30 98 26 72 24" fill="none" stroke="#3A4250" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="26" cy="78" r="8" fill="#B8C0CA" stroke="#59616C" stroke-width="2.5"/>' +
        '<path d="M22 74 L30 82 M30 74 L22 82" stroke="#59616C" stroke-width="2" stroke-linecap="round"/>' +
        '<rect x="36" y="118" width="28" height="11" rx="3" fill="#2B323C"/>' +
        '<circle cx="43" cy="123.5" r="2.2" fill="#4CE0A0"/><circle cx="50" cy="123.5" r="2.2" fill="#FFC94D"/>' +
        '<circle class="cb-blink" cx="57" cy="123.5" r="2.2" fill="#FF5A5A"/>';
    }
    if (c.blush) {
      s += '<circle cx="54" cy="112" r="10" fill="#FF7FA0" opacity="' + c.blush + '"/>' +
        '<circle cx="146" cy="112" r="10" fill="#FF7FA0" opacity="' + c.blush + '"/>';
    }
    if (key === 'organic') {
      s += cuteEyes() + '<path d="M90 114 Q100 128 110 114 Z" fill="#3A1A1F" stroke="#3A1A1F" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M95 120 Q100 124 105 120 Q100 117 95 120 Z" fill="#FF7FA0"/>';
    } else if (key === 'enhanced') {
      s += cuteEyes() + '<path d="M90 116 Q100 125 110 116" fill="none" stroke="#3A1A1F" stroke-width="3.5" stroke-linecap="round"/>';
    } else {
      s += '<circle cx="76" cy="90" r="16" fill="#1A1414"/><circle cx="82" cy="84" r="6" fill="#fff"/><circle cx="71" cy="96" r="2.6" fill="#fff"/>' +
        '<circle cx="124" cy="90" r="18" fill="#2B323C" stroke="#12161B" stroke-width="2.5"/><circle cx="124" cy="90" r="11" fill="#5E6B7C"/>' +
        '<circle class="cb-blink" cx="124" cy="90" r="5" fill="#FF5A5A"/><circle cx="118" cy="84" r="2.6" fill="#fff" opacity="0.8"/>' +
        '<path d="M91 118 L109 118" fill="none" stroke="#3A1A1F" stroke-width="3.5" stroke-linecap="round"/>';
    }
    return s + '</g>';
  }

  function generated(id) {
    return '<g class="cb-bob">' +
      '<path d="M132 26 L144 2" stroke="#4D5868" stroke-width="3" stroke-linecap="round"/>' +
      '<circle class="cb-blink" cx="145" cy="0" r="5" fill="#39D0FF"/>' +
      '<rect x="176" y="80" width="12" height="24" rx="3" fill="#46505E"/>' +
      '<path d="M188 96 C204 116 198 148 176 160" fill="none" stroke="#2B323C" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="' + BRAIN + '" fill="#D7A9B3" stroke="#8A5E69" stroke-width="4" stroke-linejoin="round"/>' +
      '<g fill="none" stroke="#8A5E69" stroke-width="3.5" stroke-linecap="round"><path d="M30 82 C38 76 48 80 48 88"/><path d="M36 112 C44 106 54 110 54 118"/></g>' +
      '<g clip-path="url(#' + id + '-brain)"><g clip-path="url(#' + id + '-metal)">' +
        '<rect x="-20" y="-40" width="250" height="260" fill="#AEB9C7"/>' +
        '<path d="M40 -40 L60 30 L120 30 L170 -40 Z" fill="#C8D2DE"/>' +
        '<g fill="none" stroke="#46505E" stroke-width="2.5" stroke-linecap="round"><path d="M60 30 L120 30"/><path d="M120 30 L132 64"/><path d="M132 64 L190 64"/><path d="M140 120 L190 120"/><path d="M110 150 L140 120"/></g>' +
        '<g fill="#46505E"><circle cx="70" cy="38" r="2.5"/><circle cx="112" cy="38" r="2.5"/><circle cx="160" cy="56" r="2.5"/><circle cx="166" cy="112" r="2.5"/><circle cx="134" cy="136" r="2.5"/></g>' +
      '</g></g>' +
      '<g clip-path="url(#' + id + '-brain)">' +
        '<path d="M14 64 C62 56 98 70 100 104 C102 146 58 168 46 190" fill="none" stroke="#46505E" stroke-width="4" stroke-linecap="round"/>' +
        '<g stroke="#2B323C" stroke-width="2.5" stroke-linecap="round"><path d="M34 56 L38 68"/><path d="M56 56 L58 68"/><path d="M78 62 L74 72"/><path d="M94 80 L104 78"/><path d="M94 120 L104 124"/><path d="M78 144 L88 150"/></g>' +
      '</g>' +
      '<path d="' + BRAIN + '" fill="none" stroke="#46505E" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="64" cy="98" r="16" fill="#1A1414"/><circle cx="70" cy="91" r="6" fill="#fff"/><circle cx="59" cy="104" r="2.6" fill="#fff"/>' +
      '<circle cx="128" cy="92" r="19" fill="#1B222C" stroke="#46505E" stroke-width="3"/>' +
      '<circle class="cb-glow" cx="128" cy="92" r="16" fill="#39D0FF"/><circle cx="128" cy="92" r="9" fill="#39D0FF"/><circle cx="124" cy="88" r="3" fill="#E6FAFF"/>' +
      '<rect x="92" y="122" width="30" height="12" rx="4" fill="#1B222C"/>' +
      '<g stroke="#39D0FF" stroke-width="1.8" opacity="0.85"><path d="M99 125 V131"/><path d="M106 125 V131"/><path d="M113 125 V131"/></g>' +
      '</g>';
  }

  function slop(id) {
    return '<g class="cb-lurch">' +
      '<ellipse cx="100" cy="172" rx="90" ry="11" fill="#6F7A4E" stroke="#47502F" stroke-width="2.5"/>' +
      '<g stroke-linecap="round"><path d="M30 118 L-2 104" stroke="#3B403C" stroke-width="15"/><path d="M30 118 L-2 104" stroke="#868F86" stroke-width="9"/>' +
      '<path d="M170 118 L202 104" stroke="#3B403C" stroke-width="15"/><path d="M170 118 L202 104" stroke="#868F86" stroke-width="9"/></g>' +
      '<g fill="none" stroke="#3B403C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M-2 104 L-12 96 M-2 104 L-14 106 M-2 104 L-10 114"/><path d="M202 104 L212 96 M202 104 L214 106 M202 104 L210 114"/></g>' +
      '<path d="M70 26 L64 10 L52 4" fill="none" stroke="#3B403C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="51" cy="3" r="4" fill="#5A2020"/>' +
      '<g class="cb-blink" stroke="#FFC94D" stroke-width="2" stroke-linecap="round"><path d="M44 -4 L40 -9"/><path d="M46 8 L41 11"/></g>' +
      '<path d="' + ROBOT + '" fill="#868F86" stroke="#3B403C" stroke-width="4" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + id + '-robot)">' +
        '<path d="M56 24 L144 24 L168 42 L32 42 Z" fill="#9AA39A"/>' +
        '<ellipse cx="150" cy="60" rx="20" ry="12" fill="#A8643A" opacity="0.6"/><ellipse cx="44" cy="120" rx="18" ry="11" fill="#A8643A" opacity="0.6"/><ellipse cx="112" cy="40" rx="12" ry="6" fill="#A8643A" opacity="0.5"/>' +
        '<rect x="34" y="54" width="30" height="22" rx="3" fill="#7A8379" stroke="#3B403C" stroke-width="2" transform="rotate(-8 49 65)"/>' +
        '<g stroke="#3B403C" stroke-width="2" stroke-linecap="round"><path d="M36 60 L62 56"/><path d="M37 70 L63 66"/></g>' +
      '</g>' +
      '<g fill="none" stroke="#3B403C" stroke-width="2.5" stroke-linecap="round"><path d="M100 42 L100 64"/><path d="M158 132 L138 124"/><path d="M146 30 L136 44 L142 50 L132 62"/></g>' +
      '<g fill="#3B403C"><circle cx="44" cy="44" r="2.5"/><circle cx="156" cy="44" r="2.5"/><circle cx="166" cy="100" r="2.5"/><circle cx="64" cy="138" r="2.5"/></g>' +
      '<path d="M170 92 C180 98 176 108 186 112" fill="none" stroke="#C0392B" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M170 98 C176 106 172 114 180 120" fill="none" stroke="#2D6CB5" stroke-width="2.5" stroke-linecap="round"/>' +
      '<rect x="50" y="74" width="100" height="34" rx="12" fill="#1E1416"/>' +
      '<circle class="cb-glow" cx="76" cy="91" r="19" fill="#FF2E2E"/><circle class="cb-glow" cx="124" cy="93" r="19" fill="#FF2E2E"/>' +
      '<circle cx="76" cy="91" r="12" fill="#FF3B3B"/><circle cx="76" cy="91" r="5" fill="#FFD0D0"/>' +
      '<ellipse cx="124" cy="94" rx="12" ry="8" fill="#FF3B3B"/><circle cx="124" cy="94" r="4" fill="#FFD0D0"/>' +
      '<path d="M112 80 L120 92 L116 96 L126 106" fill="none" stroke="#868F86" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M78 116 L122 116 L122 132 L78 132 Z" fill="#1E1416" stroke="#3B403C" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M80 116 L86 124 L92 116 L98 124 L104 116 L110 124 L116 116 L120 122 L120 116 Z" fill="#D8D2BC"/>' +
      '<path d="M80 132 L86 126 L92 132 Z" fill="#D8D2BC"/><path d="M108 132 L114 126 L120 132 Z" fill="#D8D2BC"/>' +
      '<path d="M112 132 C113 142 110 150 113 160" fill="none" stroke="#8FA35A" stroke-width="3.5" stroke-linecap="round"/><circle cx="113" cy="163" r="3" fill="#8FA35A"/>' +
      '<g fill="#7E8C52" stroke="#47502F" stroke-width="2.5"><path d="M54 140 C54 152 50 160 54 168 C60 162 62 152 62 144 Z"/><path d="M142 140 C142 152 140 160 146 168 C150 160 150 150 150 142 Z"/></g>' +
      '<g fill="none" stroke="#8FA05A" stroke-width="3" stroke-linecap="round" opacity="0.9"><path d="M96 16 q7 -6 0 -12 q-7 -6 0 -12"/><path d="M120 18 q7 -6 0 -12 q-7 -6 0 -12"/></g>' +
      '</g>' +
      '<g fill="#64748B"><g class="cb-fly"><ellipse cx="22" cy="20" rx="4" ry="3"/><ellipse cx="19" cy="16" rx="3" ry="2" fill="#E2E8F0" opacity="0.85"/><ellipse cx="25" cy="16" rx="3" ry="2" fill="#E2E8F0" opacity="0.85"/></g>' +
      '<g class="cb-fly2"><ellipse cx="178" cy="22" rx="4" ry="3"/><ellipse cx="175" cy="18" rx="3" ry="2" fill="#E2E8F0" opacity="0.85"/><ellipse cx="181" cy="18" rx="3" ry="2" fill="#E2E8F0" opacity="0.85"/></g></g>';
  }

  function svg(pct) {
    var p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    var st = stage(p);
    var id = 'cb' + (++uid);
    var body = st.key === 'generated' ? generated(id) : st.key === 'slop' ? slop(id) : fleshy(st.key, id);
    return '<svg class="cog-brain" viewBox="-16 -24 232 214" role="img" aria-label="' + st.name + ' brain, ' + p + '% AI likelihood">' +
      '<defs>' +
      '<clipPath id="' + id + '-brain"><path d="' + BRAIN + '"/></clipPath>' +
      '<clipPath id="' + id + '-metal"><path d="M-20 -40 L230 -40 L230 220 L40 220 C58 168 102 146 100 104 C98 70 62 56 -20 64 Z"/></clipPath>' +
      '<clipPath id="' + id + '-robot"><path d="' + ROBOT + '"/></clipPath>' +
      '</defs>' + body + '</svg>';
  }

  window.CogBrain = { svg: svg, stage: stage, STAGES: STAGES };
})();
