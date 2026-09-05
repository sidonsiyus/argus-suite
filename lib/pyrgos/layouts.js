// Airport layouts extracted verbatim from the original pyrgos.html (sid's data).
// Runways are line segments A→B in a ~1600×1000 pixel field space; nodes/edges = taxi network.
export const LAYOUTS = 
{
  chennai:{
    label:"Chennai · MAA (VOMM)", icao:"VOMM", metar:"VOMM", twr:"118.1", gnd:"121.9", dep:"127.9", geo:{lat:12.9941,lon:80.1709},
    sids:[
      {name:"LATID5A", rwys:["25","07"], hdg:200, alt:5000},
      {name:"GUVOX3B", rwys:["25"],      hdg:290, alt:6000},
      {name:"OPULU1D", rwys:["07","25"], hdg:110, alt:5000},
      {name:"TILNU2A", rwys:["12","30","25"], hdg:25, alt:7000}
    ],
    runways:[
      // VOMM accurate to scale — 07/25: 3658 m, TRUE 071°/251°  ·  12/30: 2045 m, TRUE 117.65°/297.65°, crossing near the 25 end (scale 0.3203 px/m)
      {id:"MAIN", ax:131,ay:760, bx:1239,by:379, w:17, nameA:"07", nameB:"25", role:"BOTH", dir:"25"},
      {id:"CROSS",ax:659,ay:286, bx:1239,by:590, w:16, nameA:"12", nameB:"30", role:"OFF",  dir:"12"}
    ],
    nodes:{
      // TWY A — main parallel, north of 07/25
      A1:{x:174,y:669},A2:{x:418,y:585},A3:{x:662,y:501},A4:{x:905,y:418},A5:{x:1138,y:338},
      // runway hold-short points
      H07:{x:134,y:696},H25:{x:1197,y:330},H12:{x:696,y:243},H30:{x:1253,y:535},
      // terminal stands (between the runways, north side)
      G1:{x:418,y:513},G2:{x:479,y:492},G3:{x:540,y:471},G4:{x:601,y:450},G5:{x:662,y:429},G6:{x:723,y:409},G7:{x:784,y:388},G8:{x:844,y:367}
    },
    edges:[["A1","A2"],["A2","A3"],["A3","A4"],["A4","A5"],
      ["A1","H07"],["A5","H25"],["A2","H12"],["A5","H30"],
      ["G1","A2"],["G2","A2"],["G3","A3"],["G4","A3"],["G5","A3"],["G6","A4"],["G7","A4"],["G8","A4"]],
    gates:["G1","G2","G3","G4","G5","G6","G7","G8"],
    holds:{ "07":"H07","25":"H25","12":"H12","30":"H30" },
    river:[[1120,470],[1178,560],[1236,688],[1288,806]]  // Adyar, crossing off the 30 end (decorative)
  },
  metro:{
    label:"PYRGOS Metro (4 parallel)", icao:"PYRG", metar:"KJFK", twr:"118.7", gnd:"121.9", dep:"125.2", geo:{lat:40.6413,lon:-73.7781},
    sids:[
      {name:"CONEY7", rwys:["27R","27C","27L","26"], hdg:250, alt:5000},
      {name:"HAPIE4", rwys:["27R","09L"], hdg:315, alt:6000},
      {name:"MERIT2", rwys:["09L","09C","09R","08"], hdg:80, alt:5000},
      {name:"WAVEY3", rwys:["27L","26"], hdg:200, alt:6000}
    ],
    runways:[
      {id:"R1", ax:280,ay:300, bx:1400,by:300, w:28, nameA:"09L", nameB:"27R", role:"ARR", dir:"27R"},
      {id:"R2", ax:280,ay:440, bx:1400,by:440, w:28, nameA:"09C", nameB:"27C", role:"ARR", dir:"27C"},
      {id:"R3", ax:280,ay:640, bx:1400,by:640, w:28, nameA:"09R", nameB:"27L", role:"DEP", dir:"27L"},
      {id:"R4", ax:280,ay:780, bx:1400,by:780, w:28, nameA:"08", nameB:"26", role:"DEP", dir:"26" }
    ],
    nodes:(()=>{ const n={}; const xs=[360,560,760,960,1160,1320];
      xs.forEach((x,i)=>{ n["S"+i]={x,y:930}; });                 // spine
      xs.forEach((x,i)=>{ n["A"+i]={x,y:300}; n["B"+i]={x,y:440}; n["C"+i]={x,y:640}; n["D"+i]={x,y:780}; });
      const gx=[400,500,600,700,800,900,1000,1100,1200,1300]; gx.forEach((x,i)=>{ n["G"+(i+1)]={x,y:1000}; });
      n.H27R={x:1320,y:346};n.H09L={x:360,y:346};n.H27C={x:1320,y:486};n.H09C={x:360,y:486};
      n.H27L={x:1320,y:686};n.H09R={x:360,y:686};n.H26={x:1320,y:826};n.H08={x:360,y:826};
      return n; })(),
    edges:(()=>{ const e=[]; const idx=[0,1,2,3,4,5];
      for(let i=0;i<5;i++)e.push(["S"+i,"S"+(i+1)]);
      idx.forEach(i=>{ e.push(["A"+i,"B"+i]);e.push(["B"+i,"C"+i]);e.push(["C"+i,"D"+i]);e.push(["D"+i,"S"+i]); });
      for(let i=1;i<=10;i++){ const near="S"+Math.min(5,Math.round((i-1)/1.8)); e.push([near,"G"+i]); }
      e.push(["A0","H09L"],["A5","H27R"],["B0","H09C"],["B5","H27C"],["C0","H09R"],["C5","H27L"],["D0","H08"],["D5","H26"]);
      return e; })(),
    gates:["G1","G2","G3","G4","G5","G6","G7","G8","G9","G10"],
    holds:{ "27R":"H27R","09L":"H09L","27C":"H27C","09C":"H09C","27L":"H27L","09R":"H09R","26":"H26","08":"H08" }
  },
  heathrow:{
    label:"London Heathrow (EGLL)", icao:"EGLL", metar:"EGLL", twr:"118.5", gnd:"121.7", dep:"120.4", geo:{lat:51.4700,lon:-0.4543},
    sids:[
      {name:"CPT4F", rwys:["27R","27L","09L","09R"], hdg:270, alt:6000},
      {name:"MID3F", rwys:["27L","27R"], hdg:185, alt:6000},
      {name:"DET1F", rwys:["09L","09R","27L"], hdg:110, alt:6000},
      {name:"BPK2F", rwys:["27R","09L"], hdg:15,  alt:6000}
    ],
    runways:[
      {id:"NR", ax:180,ay:360, bx:1500,by:360, w:28, nameA:"09L", nameB:"27R", role:"ARR", dir:"27R"},
      {id:"SR", ax:180,ay:700, bx:1500,by:700, w:28, nameA:"09R", nameB:"27L", role:"DEP", dir:"27L"}
    ],
    nodes:(()=>{ const n={}; const xs=[300,560,820,1080,1340,1440];
      xs.forEach((x,i)=>{ n["NT"+i]={x,y:430}; n["CT"+i]={x,y:530}; n["ST"+i]={x,y:630}; });
      const gx=[380,540,700,860,1020,1180,1340]; gx.forEach((x,i)=>{ n["G"+(i+1)]={x,y:580}; });
      n.H27R={x:1440,y:430}; n.H09L={x:300,y:430}; n.H27L={x:1440,y:630}; n.H09R={x:300,y:630};
      return n; })(),
    edges:(()=>{ const e=[]; const xs=[300,560,820,1080,1340,1440];
      for(let i=0;i<5;i++){ e.push(["NT"+i,"NT"+(i+1)]); e.push(["CT"+i,"CT"+(i+1)]); e.push(["ST"+i,"ST"+(i+1)]); }
      for(let i=0;i<6;i++){ e.push(["NT"+i,"CT"+i]); e.push(["CT"+i,"ST"+i]); }
      const gx=[380,540,700,860,1020,1180,1340];
      gx.forEach((x,i)=>{ let bi=0,bd=1e9; xs.forEach((cx,ci)=>{const d=Math.abs(cx-x); if(d<bd){bd=d;bi=ci;}}); e.push(["G"+(i+1),"CT"+bi]); });
      e.push(["H27R","NT5"],["H09L","NT0"],["H27L","ST5"],["H09R","ST0"]);
      return e; })(),
    gates:["G1","G2","G3","G4","G5","G6","G7"],
    holds:{ "27R":"H27R","09L":"H09L","27L":"H27L","09R":"H09R" }
  },
  delhi:{
    label:"Delhi · IGI (VIDP)", icao:"VIDP", metar:"VIDP", twr:"118.1", gnd:"121.9", dep:"125.9", geo:{lat:28.5562,lon:77.1000},
    sids:[
      {name:"PONA6A", rwys:["28","29L","29R"], hdg:270, alt:6000},
      {name:"DUKAM4B",rwys:["29L","29R","28"], hdg:200, alt:7000},
      {name:"LATER3C",rwys:["10","11R","11L"], hdg:110, alt:6000},
      {name:"GINIL2D",rwys:["28","11R"], hdg:15,  alt:7000}
    ],
    runways:[
      {id:"R1", ax:170,ay:320, bx:1510,by:320, w:28, nameA:"10",  nameB:"28",  role:"ARR",  dir:"28"},
      {id:"R2", ax:150,ay:560, bx:1530,by:560, w:30, nameA:"11R", nameB:"29L", role:"BOTH", dir:"29L"},
      {id:"R3", ax:170,ay:800, bx:1510,by:800, w:28, nameA:"11L", nameB:"29R", role:"DEP",  dir:"29R"}
    ],
    nodes:(()=>{ const n={}; const xs=[280,520,760,1000,1240,1420];
      xs.forEach((x,i)=>{ n["A"+i]={x,y:440}; n["B"+i]={x,y:680}; n["P"+i]={x,y:920}; });
      const gx=[300,470,640,810,980,1150,1320,1450]; gx.forEach((x,i)=>{ n["G"+(i+1)]={x,y:990}; });
      n.H29R={x:1420,y:860}; n.H11L={x:280,y:860};
      return n; })(),
    edges:(()=>{ const e=[]; const xs=[280,520,760,1000,1240,1420];
      for(let i=0;i<5;i++){ e.push(["A"+i,"A"+(i+1)]); e.push(["B"+i,"B"+(i+1)]); e.push(["P"+i,"P"+(i+1)]); }
      for(let i=0;i<6;i++){ e.push(["A"+i,"B"+i]); e.push(["B"+i,"P"+i]); }
      const gx=[300,470,640,810,980,1150,1320,1450];
      gx.forEach((x,i)=>{ let bi=0,bd=1e9; xs.forEach((cx,ci)=>{const d=Math.abs(cx-x); if(d<bd){bd=d;bi=ci;}}); e.push(["G"+(i+1),"P"+bi]); });
      e.push(["H29R","P5"],["H11L","P0"]);
      return e; })(),
    gates:["G1","G2","G3","G4","G5","G6","G7","G8"],
    holds:{ "28":"A5","10":"A0", "29L":"B5","11R":"B0", "29R":"H29R","11L":"H11L" }
  }
};
export const LAYOUT_KEYS = Object.keys(LAYOUTS);
