import { useState, useRef } from "react";

const PIZZA_CRITERIA = [
  { id: "rim",       label: "Rim",       desc: "Correct crust, proper rim width/height per crust type, PSC unsealed <25%" },
  { id: "size",      label: "Size",      desc: "Correct dough size/type, fits box (not >¾\" off), correct center rise" },
  { id: "portion",   label: "Portion",   desc: "Correct toppings, proper sauce/cheese/toppings/garlic oil amounts" },
  { id: "placement", label: "Placement", desc: "Even distribution <25% incorrect, toppings to edge, correct sauce border" },
  { id: "bake",      label: "Bake",      desc: "Golden brown, bubbles <1¾\" dia, no gel layer, no carbon, cheese melted" },
];

const SIDE_CRITERIA = [
  { id: "size",      label: "Size",      desc: "SCB 4\"×10\", chicken 8/16/32 only, boneless sizing correct, fits in box" },
  { id: "portion",   label: "Portion",   desc: "Correct toppings and portions in use" },
  { id: "placement", label: "Placement", desc: "Loaded items touching/minimal gaps, toppings even, squeeze bottle for sauces" },
  { id: "bake",      label: "Bake",      desc: "SCB golden brown bottom, bread bites golden, cheese melted, no burnt cheese, no carbon" },
];

const WIZARD_STEPS = [
  { id: "info",    label: "Store Info",   section: null },
  { id: "criticals", label: "Criticals", section: null },
  { id: "pizzas",  label: "Pizzas",       section: "product" },
  { id: "sides",   label: "Sides",        section: "product" },
  { id: "pp_dough_inuse",  label: "Dough In-Use",         section: "pp", points: 4,
    criteria: ["Dough in use properly proofed, not expired","All offered sizes at stretch table","Dough NOT used directly from walk-in"],
    comments: ["All dough sizes present at stretch table and properly proofed.","Dough used directly from walk-in — must proof to room temp first.","Under-proofed dough in use — allow full proof time.","Missing a dough size at stretch table during observation."] },
  { id: "pp_dough_sys",    label: "Dough System",          section: "pp", points: 3,
    criteria: ["Evidence of system for daily dough needs","All sizes in walk-in","Next-in-use dough proofing, not expired","All walk-in dough covered & labeled","Proofing dough labeled with time removed"],
    comments: ["Dough system clearly in place — walk-in well organized.","Walk-in dough not labeled with time removed from cooler.","Proofing dough missing time labels — correct immediately.","Missing dough sizes in walk-in.","Excellent dough organization and labeling throughout."] },
  { id: "pp_pizza_proc",   label: "Pizza Procedures",      section: "pp", points: 3,
    criteria: ["Garlic Oil Blend on all Hand Tossed","Not systematically over-portioning","No prepped skins/floats cheesed, sauced, or refrigerated","No dough dockers or rolling pins","Only approved packaging","Cut & packaged per standards","Pan pizzas built properly (silicone brush, tri-tip)","PSC built correctly — no pre-prepping, string cheese only","No parchment paper; no un-picked pit cheese"],
    comments: ["Pizza procedures followed correctly throughout.","Garlic oil blend not applied to hand tossed — needs correction.","Pre-prepped skins found at makeline — must be made to order.","Rolling pin found in use — prohibited.","Tri-tip bottle not used for pan sauce — retrain.","PSC pre-prepped — not permitted.","Post-bake sauce applied by hand instead of squeeze bottle."] },
  { id: "pp_side_proc",    label: "Side Procedures",       section: "pp", points: 3,
    criteria: ["All sides prepared & baked per Product Standard","Sides packaged per Product Standard","Sandwich bread at room temp","SCB & Bread Bites at room temp — not refrigerated","Prepped Bread Bites covered with pan lid","Marbled Cookie Brownie / SCB not cut post-bake","Bread sides properly proofed in window","Loaded Chicken smallware for prep only"],
    comments: ["Side item procedures followed correctly.","SCB found under refrigeration — not permitted.","Marbled Cookie Brownie cut post-bake — discontinue.","Bread Bites not covered — drying out risk.","Loaded Chicken smallware used in oven — not allowed."] },
  { id: "pp_dating",       label: "Dating Procedures",     section: "pp", points: 2,
    criteria: ["Current Shelf Life Guide posted in store","Approved dating system in use","All products dated; no more than 4 unlabeled","Day 1 = prep date regardless of time","Products dated at correct stage (Unopened/Prepped/In Use)","Carryover bin color poster on walk-in door (if applicable)","DJ cornmeal tub poster on walk-in door (if applicable)"],
    comments: ["Dating procedures fully upheld.","Shelf Life Guide not posted — print and post immediately.","Multiple unlabeled products found.","Products labeled with prep date rather than expiration.","Carryover poster not present on walk-in door."] },
  { id: "pp_handling",     label: "Product Handling",      section: "pp", points: 2,
    criteria: ["Carryover procedures followed","Makeline bins not overstocked","Open products in clean airtight container","Open packaging closed with food-grade clip (no metal springs)","Frozen products thawed via approved method","Toppings on side procedures followed","Food contact surfaces sanitized every 2 hours","Pizza sauce in squeeze bottles from new unopened bag","No raw meat or eggs","Beverage coolers — Coke products only","Food safe gloves available","RTE procedures: gloves, no bare hand contact"],
    comments: ["Product handling procedures followed correctly.","Makeline bins overstocked — temp risk.","Open containers without lids in walk-in.","Metal spring clips on open bags — replace with food-grade clips.","Pizza sauce bottle not from new bag.","Cut table not sanitized within 2-hour window.","Beverage cooler had non-Coke items — remove."] },
  { id: "pp_cheese_sauce", label: "Cheese & Sauce Systems",section: "pp", points: 2,
    criteria: ["Pizza cheese thawed under refrigeration 33–41°F","Evidence of food-safe tempering system","Cheese in-use thawed, minimum 33°F","Adequate pizza sauce prepped for all crust types","Pizza sauce at makeline ≥50°F (10°C)"],
    comments: ["Cheese and sauce systems operating correctly.","Pizza sauce below 50°F at makeline — adjust.","Cheese tempering system not evident.","Sauce not prepped for all crust types."] },
  { id: "pp_setup",        label: "Store Setup / PRP",     section: "pp", points: 2,
    criteria: ["Makeline & beverage coolers stocked for sales volume","Products prepped for expected volume","All required products carried","Non-refrigerated makeline sauces ≥50°F","Not out of any menu items","All in-use products properly thawed","Only Approved Supplier List products","At least one oven on","Management + 1 delivery-capable team member present","At least one operational heat rack on","Customer entrance unlocked, area fully set up"],
    comments: ["Store fully set up and stocked for expected volume.","Out of a menu item during assessment.","Heat rack not turned on.","Customer area not fully set up.","Non-approved product found in use."] },
  { id: "pp_tools",        label: "Required Tools",        section: "pp", points: 1,
    criteria: ["Digital stem thermometer accessible, calibrated ±2°F/1°C","Calibrated working scale(s) available","Most recent product build job aids posted","Approved Pizza Grading Tool available and in good repair"],
    comments: ["All required tools present and in good repair.","Thermometer not calibrated — calibrate immediately.","Scale not functioning — repair or replace.","Pizza Grading Tool not found.","Job aids outdated — print current versions."] },
  { id: "cl_interior",     label: "Store Interior",        section: "cl", points: 3,
    criteria: ["Ceiling tiles, T-bars, vents, fixtures: clean & operational","Walls clean and in good repair","Floors and baseboards clean and in good repair","Personnel restrooms clean, good repair, fully stocked","Ambient store temp 60–90°F in all areas"],
    comments: ["Store interior clean and well-maintained.","Ceiling tiles stained/damaged — replace or clean.","Baseboards have buildup — deep clean needed.","Restroom not stocked — restock immediately.","Ambient temp out of range — address HVAC.","Walls show grease buildup near makeline."] },
  { id: "cl_expired",      label: "No Expired Products",   section: "cl", points: 2,
    criteria: ["All products within shelf life on store premises"],
    comments: ["All products within shelf life — no expired items found.","Expired product found — discard and audit dating process.","Multiple expired items across categories.","One expired item found and discarded during assessment."] },
  { id: "cl_temps",        label: "Refrigeration Temps",   section: "cl", points: 2,
    criteria: ["Walk-in: 33–38°F","Makeline bin/cabinet: 33–41°F","Additional refrigeration: 33–41°F","Beverage cooler: 33–43°F","No refrigerated product exceeding 41°F"],
    comments: ["All refrigeration units within specified temp ranges.","Walk-in temp above spec — service immediately.","Makeline cabinet running warm — monitor and service.","Beverage cooler outside spec — adjust thermostat."] },
  { id: "cl_bake_temps",   label: "End Bake Temps",        section: "cl", points: 2,
    criteria: ["All product out of oven ≥165°F (74°C)","Ready to Eat products ≥135°F (57°C)"],
    comments: ["All baked products met required end temperatures.","Product exit temp below 165°F — adjust oven settings.","RTE product not reaching 135°F minimum."] },
  { id: "cl_pest",         label: "Pest Control",          section: "cl", points: 2,
    criteria: ["No evidence of cockroaches, birds, ants, bats, beetles, rodents, flies","No rodent droppings; fewer than 10 flying insects","No other animals present","Proof of PCO service every 4–6 weeks; recent report on file","Doors/windows not propped open without screens"],
    comments: ["No pest activity; PCO report current and on file.","PCO report not available — obtain and file immediately.","Flying insects observed — investigate entry points.","Back door propped open without screen.","PCO service overdue — schedule immediately."] },
  { id: "cl_oven",         label: "Ovens & Hood",          section: "cl", points: 2,
    criteria: ["All oven/hood components present and installed","Two approved working ovens","Oven fingers, conveyor, hood clean and working","Exterior, catch trays, heat racks, disk catcher clean","Oven finger arrangement per current Standards","Oven time per Oven Standards"],
    comments: ["Ovens and hood clean and fully operational.","Catch trays have excessive carbon — clean immediately.","Hood showing grease yellowing — degrease thoroughly.","Only one working oven — must have two.","Oven time not set per standards.","Oven fingers not arranged per current standards."] },
  { id: "cl_walkin",       label: "Walk-In",               section: "cl", points: 2,
    criteria: ["Floors, walls, ceilings, shelves, curtains, condensers, gaskets: clean, mold-free","All components in good repair","Condenser free of ice; no standing water","Lights covered with protective shield or non-breakable bulb"],
    comments: ["Walk-in clean and fully operational.","Walk-in floor has standing water — inspect drain.","Condenser has ice buildup — defrost and service.","Walk-in light not covered — install shield.","Door gasket damaged/moldy — replace."] },
  { id: "cl_makeline",     label: "Makeline & Refrigeration", section: "cl", points: 2,
    criteria: ["Rail, cabinet, catch trays, covers, grates, handles, gaskets, condenser, shelves: clean","All makeline components in good repair","Makeline condenser free of ice; no standing water","Additional refrigeration clean, operational, no mold/rust/ice"],
    comments: ["Makeline and additional refrigeration clean and operational.","Makeline rail covers/gaskets have mold — clean thoroughly.","Makeline condenser has ice buildup.","Additional refrigeration unit has standing water.","Catch trays have debris — clean and sanitize."] },
  { id: "cl_hygiene",      label: "Personnel Hygiene",     section: "cl", points: 2,
    criteria: ["No tobacco/e-cigarettes in store or in logo apparel","Personnel clean, body odor minimized","Facial hair ≤1\" (beard guard if exception granted)","Hair exceeding collar restrained","No temporary hair color products","Jewelry limits followed (earrings, necklace, wedding ring only)","No wrist/arm jewelry during food prep (plain bands OK)","Gauges ≤¾\"; one facial piercing (no septum/dermal)","Fingernails ≤¼\" beyond fingertip; no painted/artificial nails without gloves","Proper handwashing; sanitizer not replacing handwashing","No bare hand contact with post-bake food","Approved apron worn by all food prep personnel"],
    comments: ["All personnel met appearance and hygiene standards.","Team member with facial hair exceeding 1\".","Jewelry on wrists during food prep — remove.","Handwashing not followed before glove application.","Personnel without apron during food prep.","Artificial nails without gloves observed."] },
  { id: "cl_prep_surfaces",label: "Prep Surfaces & Storage", section: "cl", points: 1,
    criteria: ["Prep tables, carts, shelves, dunnage racks: clean, rust-free","Food/packaging stored ≥6\" from floor on racks or ≥4\" on dollies","Dough trays/roll cages not stored outside unless approved enclosure","Food not stored in restrooms","Sanitizer container readily available at all times"],
    comments: ["All prep surfaces and storage areas clean and compliant.","Dough trays stored outside without approved enclosure.","Product stored on floor.","Sanitizer bucket not available during assessment.","Prep table has rust or damage."] },
  { id: "cl_sinks",        label: "Sinks",                 section: "cl", points: 1,
    criteria: ["Hot and cold water functional","Hand sink(s) operational, clean, fully stocked","3-compartment sink operational, clean, mold-free","Sanitizer solutions at proper concentration","Sanitizer strips available, not expired"],
    comments: ["All sinks operational, clean, and stocked.","Hand sink not stocked with soap or paper towels.","Sanitizer solution not at proper concentration.","Sanitizer test strips expired.","3-compartment sink has visible buildup."] },
  { id: "cl_smallwares",   label: "Smallwares & Bakewares",section: "cl", points: 1,
    criteria: ["Only approved smallwares, utensils, bakewares in use","Sufficient supply available","All utensils/bakewares clean and in good repair","Pans, mats, screens/disks free of excessive carbon","Dough trays and covers clean, mold-free"],
    comments: ["Smallwares and bakewares sufficient, clean, and approved.","Non-approved smallwares in use — replace.","Pans have excessive carbon — clean or retire.","Insufficient supply of baking screens.","Dough tray covers have mold — replace."] },
  { id: "bi_uniform",      label: "Uniform Standards",     section: "bi", points: 3,
    criteria: ["All personnel in current Domino's apparel","Apparel clean, properly worn, good condition","Black bottoms only (correct material, no rips/yoga/spandex)","Bottoms at natural waistline; shorts ≥6\" inseam, ≤2\" below knee","Undershirt plain white or black, tucked in","Only Domino's logo joggers permitted","Shoes covering entire foot"],
    comments: ["All team members in proper uniform.","Team member in non-black bottoms.","Undershirt not white or black.","Shoes not covering entire foot.","Non-approved joggers worn.","Bottoms not at natural waistline."] },
  { id: "bi_customer_area",label: "Customer Area",         section: "bi", points: 3,
    criteria: ["Ceiling, vents, fixtures: clean and operational","Walls clean and in good repair","Floors and baseboards clean","Counters, tables, seating, equipment clean","No general storage in customer area","Customer restrooms clean, stocked"],
    comments: ["Customer area clean and making a great impression.","Customer area floors have debris.","General storage visible in customer area.","Customer restroom not stocked.","Counter area has buildup.","Lighting fixture not operational in customer area."] },
  { id: "bi_exterior",     label: "Store Exterior",        section: "bi", points: 3,
    criteria: ["Parking lot free of trash, no excessive oil stains/potholes","Sidewalk free of trash, debris, excessive weeds","Windows and windowsills clean and in good repair","Exterior clean, in good repair, not discolored","No graffiti in or outside store"],
    comments: ["Store exterior presenting a positive brand image.","Parking lot has trash and debris.","Sidewalk has excessive weeds.","Windows dirty — clean thoroughly.","Graffiti present on exterior — remove immediately."] },
  { id: "bi_tech",         label: "Domino's Technology",   section: "bi", points: 2,
    criteria: ["Bump bar present near makeline and fully functioning","Cut Table Tech fully setup and functional","Carryout Tracker and Menu Boards functional","Computer terminals, keyboards, monitors clean"],
    comments: ["All technology fully operational and clean.","Bump bar not functioning — troubleshoot or replace.","Cut Table Tech not mounted properly.","Carryout Tracker not operational.","Keyboards/monitors have significant dirt buildup."] },
  { id: "bi_greeting",     label: "Customer Greeting",     section: "bi", points: 1,
    criteria: ["Walk-in customers greeted within 15 seconds","Pick-up window greeted within 30 seconds","Music not interfering with customer conversation"],
    comments: ["Customers greeted promptly — great service.","Customer entered and not greeted within 15 seconds.","Pick-up window customer waited over 30 seconds.","Music volume too high — turn down."] },
  { id: "bi_delivery",     label: "Delivery Vehicles",     section: "bi", points: 1,
    criteria: ["Vehicles no excessive exterior damage","Vehicle interiors clean, no alcohol/marijuana/drugs","No offensive stickers or painted messages","Safety equipment worn while in motion","eBike operators: helmet + chinstrap + vest; no dual-ear headsets"],
    comments: ["Delivery vehicles and experts representing brand well.","Delivery vehicle has excessive exterior damage.","Offensive bumper sticker observed — must be removed.","Vehicle interior excessively cluttered."] },
  { id: "bi_signage",      label: "Signage",               section: "bi", points: 1,
    criteria: ["All interior/exterior signage displayed, clean, illuminated","Open Sign, Building Sign, Pole Sign, DCD, Pie Pass functional","All posted items typewritten or professionally printed","Open sign illuminated open to close","Approved menu accessible to customers at all times","Store hours decal accurate and in good repair"],
    comments: ["All signage clean, illuminated, and in good repair.","Open sign not illuminated.","Store hours decal inaccurate — update immediately.","Handwritten materials found — must be professionally printed.","No approved menu accessible to customers."] },
  { id: "bi_hotbags",      label: "Hot Bags",              section: "bi", points: 1,
    criteria: ["Interior/exterior of hot bags clean and in good repair","Only approved hot bags in use","Minimum 12 hot bags on hand","Every order in separate hot bag","Cold bags clean and in good repair"],
    comments: ["Hot bags sufficient and clean.","Fewer than 12 hot bags — order more immediately.","Hot bags dirty or damaged.","Non-approved hot bags in use.","Orders leaving without hot bag."] },
  { id: "bs_cash",         label: "Safe Cash Procedures",  section: "bs", points: 2,
    criteria: ["Time-delay/dual-key/smart safe functional and in use","Fewer than 3 days' deposits in safe","Time-delay safe ≥9-minute delay","MIC has access to designated safe portions","Till/cash drawer operational and locked","Single till ≤$150; multiple tills ≤$75 each","Delivery personnel carry <$20 when leaving","Delivery Experts make drops after every delivery"],
    comments: ["Safe cash procedures fully compliant.","More than 3 days' deposits in safe — deposit immediately.","Till not locked — correct immediately.","Till over maximum cash limit — make a drop.","Delivery expert left with more than $20.","Safe delay not at 9-minute minimum."] },
  { id: "bs_weapons",      label: "No Weapons",            section: "bs", points: 1,
    criteria: ["No weapons on premises, in vehicles, or on personnel","No pocketknives or knives with blades <3\" on premises"],
    comments: ["No weapons found on premises.","Pocketknife found on premises — remove.","Team member had mace — not permitted on store premises."] },
  { id: "bs_callbacks",    label: "Security Callbacks",    section: "bs", points: 1,
    criteria: ["Security callback before delivery for: first-time cash customers, no-Caller-ID orders, suspicious orders"],
    comments: ["Security callbacks being completed correctly.","First-time cash order dispatched without callback.","No-Caller-ID order dispatched without callback."] },
  { id: "overall",         label: "Overall Comments",      section: null },
  { id: "report",          label: "Report",                section: null },
];

const CRITICAL_ELEMENTS = [
  { id: "cr1",  cat: "Product",      label: "Dough management neglected (sheeted, under-proofed, pre-date, expired 2+ days, missing sizes/crust types)" },
  { id: "cr2",  cat: "Product",      label: "5 or more pizzas evaluated as a remake" },
  { id: "cr3",  cat: "Food Safety",  label: "4+ sizes/types expired OR 8+ sizes/types unlabeled (non-dough)" },
  { id: "cr4",  cat: "Food Safety",  label: "Lack of cleaning supplies, potable water, or no functioning hand sink" },
  { id: "cr5",  cat: "Food Safety",  label: "Hazardous temps: refrigerated unit/product ≥50°F OR 4+ baked products <165°F" },
  { id: "cr6",  cat: "Food Safety",  label: "Pest control past critical thresholds (2+ roaches, rodents outside traps, 25+ droppings, 15+ flying insects, pests in food)" },
  { id: "cr7",  cat: "Food Safety",  label: "Mold on food products or food contact surfaces directly exposed to food" },
  { id: "cr8",  cat: "Brand Image",  label: "5 or more core apparel, appearance, and/or hygiene violations" },
  { id: "cr9",  cat: "Brand Image",  label: "Mature content / profanity found on store premises" },
  { id: "cr10", cat: "Brand Safety", label: "Firearms, knives ≥3\", illegal drugs, marijuana (any form), or alcohol found on premises" },
];

const SECTION_META = {
  product: { label: "Product",                  color: "#dc2626" },
  pp:      { label: "Product Procedures",        color: "#d97706" },
  cl:      { label: "Cleanliness & Food Safety", color: "#2563eb" },
  bi:      { label: "Brand Image",               color: "#16a34a" },
  bs:      { label: "Brand Safety",              color: "#7c3aed" },
};

const GROUP_DEFS = [
  { label: "Setup",     ids: ["info", "criticals"] },
  { label: "Product",   ids: ["pizzas", "sides"] },
  { label: "Prod. Proc.", ids: WIZARD_STEPS.filter(s => s.section === "pp").map(s => s.id) },
  { label: "Clean/FS",  ids: WIZARD_STEPS.filter(s => s.section === "cl").map(s => s.id) },
  { label: "Brand",     ids: WIZARD_STEPS.filter(s => s.section === "bi" || s.section === "bs").map(s => s.id) },
  { label: "Finish",    ids: ["overall", "report"] },
];

function getRating(pct) {
  if (pct >= 90) return { stars: 5, label: "5 Star", color: "#f59e0b" };
  if (pct >= 80) return { stars: 4, label: "4 Star", color: "#94a3b8" };
  if (pct >= 70) return { stars: 3, label: "3 Star", color: "#a16207" };
  if (pct >= 60) return { stars: 2, label: "2 Star", color: "#dc2626" };
  if (pct >= 50) return { stars: 1, label: "1 Star", color: "#dc2626" };
  return { stars: 0, label: "0 Star", color: "#555" };
}

export default function OAGrader() {
  const [stepIdx, setStepIdx] = useState(0);
  const [storeNum, setStoreNum]   = useState("");
  const [assessor, setAssessor]   = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [criticals, setCriticals] = useState({});
  const [pizzas, setPizzas] = useState(() =>
    Object.fromEntries([...Array(7)].map((_, i) => [`p${i}`, { crust: "", rim: null, size: null, portion: null, placement: null, bake: null, note: "" }]))
  );
  const [sides, setSides] = useState(() =>
    Object.fromEntries([...Array(3)].map((_, i) => [`s${i}`, { type: "", size: null, portion: null, placement: null, bake: null, note: "" }]))
  );
  const [stepData, setStepData] = useState({});
  const [overallComment, setOverallComment] = useState("");
  const fileRefs = useRef({});

  const step = WIZARD_STEPS[stepIdx];
  const stepColor = step.section ? SECTION_META[step.section]?.color : step.id === "report" ? "#475569" : "#dc2626";

  const pizzaScore = () => {
    let t = 0;
    for (let i = 0; i < 7; i++) {
      const p = pizzas[`p${i}`];
      const graded = PIZZA_CRITERIA.map(c => p[c.id]).filter(v => v !== null);
      if (!graded.length) continue;
      const fails = graded.filter(v => v === "fail").length;
      t += Math.max(0, 4 - fails * 0.8);
    }
    return Math.min(28, Math.round(t * 10) / 10);
  };

  const sideScore = () => {
    let t = 0;
    for (let i = 0; i < 3; i++) {
      const s = sides[`s${i}`];
      const graded = SIDE_CRITERIA.map(c => s[c.id]).filter(v => v !== null);
      if (!graded.length) continue;
      const fails = graded.filter(v => v === "fail").length;
      t += Math.max(0, 3 - fails * 0.75);
    }
    return Math.min(9, Math.round(t * 10) / 10);
  };

  const getStepPts = s => s.points ? (stepData[s.id]?.pts ?? s.points) : 0;

  const totalPts = () => {
    let t = pizzaScore() + sideScore();
    WIZARD_STEPS.forEach(s => { if (s.points) t += getStepPts(s); });
    const cc = Object.values(criticals).filter(Boolean).length;
    return Math.max(0, Math.round((t - cc * 10) * 10) / 10);
  };

  const maxPts = () => {
    let m = 37;
    WIZARD_STEPS.forEach(s => { if (s.points) m += s.points; });
    return m;
  };

  const pct = Math.round((totalPts() / maxPts()) * 100);
  const rating = getRating(pct);

  const isComplete = s => {
    if (s.id === "info") return !!(storeNum && assessor);
    if (s.id === "criticals" || s.id === "overall" || s.id === "report") return true;
    if (s.id === "pizzas") return [...Array(7)].every((_, i) => PIZZA_CRITERIA.every(c => pizzas[`p${i}`][c.id] !== null));
    if (s.id === "sides")  return [...Array(3)].every((_, i) => SIDE_CRITERIA.every(c => sides[`s${i}`][c.id] !== null));
    if (s.points) return stepData[s.id] !== undefined;
    return true;
  };

  const incomplete = WIZARD_STEPS.filter(s => s.id !== "report" && !isComplete(s));

  const setPizzaCell = (pi, key, val) => setPizzas(p => ({ ...p, [`p${pi}`]: { ...p[`p${pi}`], [key]: p[`p${pi}`][key] === val ? null : val } }));
  const setSideCell  = (si, key, val) => setSides(p =>  ({ ...p, [`s${si}`]: { ...p[`s${si}`],  [key]: p[`s${si}`][key]  === val ? null : val } }));

  const upd = (field, val) => setStepData(p => ({ ...p, [step.id]: { pts: step.points, comments: "", photos: [], ...p[step.id], [field]: val } }));

  const addQuickComment = c => {
    const cur = stepData[step.id]?.comments || "";
    upd("comments", cur ? cur + "\n" + c : c);
  };

  const handlePhoto = e => Array.from(e.target.files).forEach(file => {
    const r = new FileReader();
    r.onload = ev => setStepData(p => {
      const cur = p[step.id] || { pts: step.points, comments: "", photos: [] };
      return { ...p, [step.id]: { ...cur, photos: [...(cur.photos || []), { name: file.name, url: ev.target.result }] } };
    });
    r.readAsDataURL(file);
  });

  const removePhoto = idx => setStepData(p => ({ ...p, [step.id]: { ...p[step.id], photos: p[step.id].photos.filter((_, i) => i !== idx) } }));

  const buildReport = () => {
    let b = `DOMINO'S OPERATIONS ASSESSMENT\n${"═".repeat(46)}\n`;
    b += `Store #${storeNum || "—"}  |  ${assessor || "—"}  |  ${visitDate}\n`;
    b += `SCORE: ${totalPts()}/${maxPts()} (${pct}%) — ${rating.label}\n\n`;
    const cc = Object.values(criticals).filter(Boolean).length;
    if (cc) {
      b += `⚠ CRITICAL VIOLATIONS (${cc}, −${cc * 10} pts)\n`;
      CRITICAL_ELEMENTS.filter(c => criticals[c.id]).forEach(c => { b += `  • [${c.cat}] ${c.label}\n`; });
      b += "\n";
    }
    b += `PIZZAS: ${pizzaScore()}/28\n`;
    for (let i = 0; i < 7; i++) {
      const p = pizzas[`p${i}`];
      const fails = PIZZA_CRITERIA.filter(c => p[c.id] === "fail").map(c => c.label);
      b += `  Pizza ${i+1}${p.crust ? ` (${p.crust})` : ""}: ${fails.length ? `FAILS — ${fails.join(", ")}` : "✓ Great"}`;
      if (p.note) b += ` — ${p.note}`;
      b += "\n";
    }
    b += `\nSIDES: ${sideScore()}/9\n`;
    for (let i = 0; i < 3; i++) {
      const s = sides[`s${i}`];
      const fails = SIDE_CRITERIA.filter(c => s[c.id] === "fail").map(c => c.label);
      b += `  Side ${i+1}${s.type ? ` (${s.type})` : ""}: ${fails.length ? `FAILS — ${fails.join(", ")}` : "✓ Great"}`;
      if (s.note) b += ` — ${s.note}`;
      b += "\n";
    }
    WIZARD_STEPS.forEach(s => {
      if (!s.points) return;
      const d = stepData[s.id];
      b += `\n[${SECTION_META[s.section]?.label}] ${s.label}: ${d?.pts ?? s.points}/${s.points}`;
      if (d?.comments) b += `\n  ${d.comments}`;
    });
    if (overallComment) b += `\n\nOVERALL:\n${overallComment}`;
    return b;
  };

  const emailReport = () => {
    const sub = `OA — Store #${storeNum} — ${visitDate} — ${rating.label} (${pct}%)`;
    window.location.href = `mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(buildReport())}`;
  };

  const go = dir => setStepIdx(i => Math.max(0, Math.min(WIZARD_STEPS.length - 1, i + dir)));
  const curPts      = step.points ? (stepData[step.id]?.pts ?? step.points) : null;
  const curComments = stepData[step.id]?.comments || "";
  const curPhotos   = stepData[step.id]?.photos || [];

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#e8e8e8", fontFamily: "'Trebuchet MS', sans-serif", display: "flex", flexDirection: "column", maxWidth: 700, margin: "0 auto" }}>

      <div style={{ background: "#b91c1c", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.7 }}>DOMINO'S PIZZA</div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>OA Grader 2026</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: pct >= 70 ? "#86efac" : "#fca5a5" }}>{pct}%</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>{totalPts()}/{maxPts()} · {rating.label}</div>
        </div>
      </div>

      {incomplete.length > 0 && (
        <div style={{ background: "#78350f", padding: "6px 14px", fontSize: 11, color: "#fde68a", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span>⚠ {incomplete.length} step{incomplete.length > 1 ? "s" : ""} incomplete</span>
          <button onClick={() => { const idx = WIZARD_STEPS.findIndex(s => !isComplete(s)); if (idx >= 0) setStepIdx(idx); }}
            style={{ background: "#92400e", border: "none", color: "#fde68a", padding: "3px 9px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>
            Go to first →
          </button>
        </div>
      )}

      <div style={{ display: "flex", background: "#161616", borderBottom: "1px solid #222", overflowX: "auto", flexShrink: 0 }}>
        {GROUP_DEFS.map(g => {
          const active = g.ids.includes(step.id);
          const hasGap = g.ids.some(id => { const s = WIZARD_STEPS.find(w => w.id === id); return s && !isComplete(s); });
          return (
            <button key={g.label}
              onClick={() => { const i = WIZARD_STEPS.findIndex(w => w.id === g.ids[0]); if (i >= 0) setStepIdx(i); }}
              style={{ background: "none", border: "none", borderBottom: active ? `2px solid ${stepColor}` : "2px solid transparent", color: active ? "#fff" : "#666", padding: "9px 11px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 11, fontWeight: active ? 700 : 400, position: "relative" }}>
              {g.label}
              {hasGap && <span style={{ position: "absolute", top: 5, right: 3, width: 5, height: 5, background: "#f59e0b", borderRadius: "50%" }} />}
            </button>
          );
        })}
      </div>

      <div style={{ background: "#141414", padding: "10px 16px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          {step.section && <div style={{ fontSize: 9, color: stepColor, letterSpacing: 2, marginBottom: 1 }}>{SECTION_META[step.section]?.label?.toUpperCase()}</div>}
          <div style={{ fontSize: 17, fontWeight: 700 }}>{step.label}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Step {stepIdx + 1} of {WIZARD_STEPS.length}</div>
        </div>
        {step.points && (
          <div style={{ background: stepColor + "22", border: `1px solid ${stepColor}44`, borderRadius: 20, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: stepColor, lineHeight: 1 }}>{curPts}</div>
            <div style={{ fontSize: 10, color: "#666" }}>of {step.points} pts</div>
          </div>
        )}
        {step.id === "pizzas" && (
          <div style={{ background: "#dc262622", border: "1px solid #dc262644", borderRadius: 20, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>{pizzaScore()}</div>
            <div style={{ fontSize: 10, color: "#666" }}>of 28 pts</div>
          </div>
        )}
        {step.id === "sides" && (
          <div style={{ background: "#dc262622", border: "1px solid #dc262644", borderRadius: 20, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>{sideScore()}</div>
            <div style={{ fontSize: 10, color: "#666" }}>of 9 pts</div>
          </div>
        )}
      </div>

      <div className="scroll-area" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

        {step.id === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 440 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Fill in before starting the assessment.</div>
            {[{l:"Store Number", v: storeNum, s: setStoreNum, p: "e.g. 4821"}, {l:"Assessor Name", v: assessor, s: setAssessor, p: "Your name"}].map(f => (
              <div key={f.l}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 1.5, marginBottom: 5 }}>{f.l.toUpperCase()}</div>
                <input value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p}
                  style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", padding: "10px 12px", borderRadius: 8, fontSize: 15, boxSizing: "border-box", outline: "none" }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1.5, marginBottom: 5 }}>ASSESSMENT DATE</div>
              <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)}
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", padding: "10px 12px", borderRadius: 8, fontSize: 15, boxSizing: "border-box", outline: "none" }} />
            </div>
          </div>
        )}

        {step.id === "criticals" && (
          <div>
            <div style={{ fontSize: 11, color: "#b91c1c", background: "#3f0d12", borderRadius: 6, padding: "8px 12px", marginBottom: 14 }}>
              Each triggered critical = <strong>−10 points</strong> from final score. Tap to mark.
            </div>
            {CRITICAL_ELEMENTS.map(c => (
              <button key={c.id} onClick={() => setCriticals(p => ({ ...p, [c.id]: !p[c.id] }))}
                style={{ width: "100%", textAlign: "left", background: criticals[c.id] ? "#3f0d12" : "#181818", border: `1px solid ${criticals[c.id] ? "#b91c1c" : "#252525"}`, color: "#e8e8e8", borderRadius: 8, padding: "11px 13px", marginBottom: 8, cursor: "pointer", display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, color: criticals[c.id] ? "#f87171" : "#3a3a3a", flexShrink: 0 }}>
                  {criticals[c.id] ? "☑" : "☐"}
                </span>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, color: criticals[c.id] ? "#f87171" : "#555", marginBottom: 2 }}>{c.cat.toUpperCase()}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>{c.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step.id === "pizzas" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Tap ✓ / ✗ for each criteria. Tap again to unset. 3+ fails = Remake.</div>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
              <thead>
                <tr style={{ background: "#1a1a1a" }}>
                  <th style={TH}>Pizza / Crust</th>
                  {PIZZA_CRITERIA.map(c => <th key={c.id} style={TH} title={c.desc}>{c.label}</th>)}
                  <th style={{ ...TH, width: 110 }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(7)].map((_, i) => {
                  const p = pizzas[`p${i}`];
                  const failCount = PIZZA_CRITERIA.filter(c => p[c.id] === "fail").length;
                  const remake = failCount >= 3;
                  return (
                    <tr key={i} style={{ background: remake ? "#250608" : i % 2 ? "#141414" : "#111" }}>
                      <td style={{ padding: "5px 8px" }}>
                        <input value={p.crust} onChange={e => setPizzas(prev => ({ ...prev, [`p${i}`]: { ...prev[`p${i}`], crust: e.target.value } }))}
                          placeholder={`#${i+1}`}
                          style={{ background: "transparent", border: "none", color: "#ccc", fontSize: 11, width: "100%", outline: "none" }} />
                        {remake && <div style={{ fontSize: 9, color: "#f87171", letterSpacing: 1, fontWeight: 700 }}>REMAKE</div>}
                      </td>
                      {PIZZA_CRITERIA.map(c => (
                        <td key={c.id} style={{ padding: "4px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                            {[["pass","✓","#166534","#86efac"], ["fail","✗","#7f1d1d","#fca5a5"]].map(([v, sym, bg, fg]) => (
                              <button key={v} onClick={() => setPizzaCell(i, c.id, v)}
                                style={{ width: 34, height: 22, borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 800, background: p[c.id] === v ? bg : "#1e1e1e", color: p[c.id] === v ? fg : "#3a3a3a" }}>
                                {sym}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: "4px 5px" }}>
                        <input value={p.note} onChange={e => setPizzas(prev => ({ ...prev, [`p${i}`]: { ...prev[`p${i}`], note: e.target.value } }))}
                          placeholder="note..."
                          style={{ background: "#1a1a1a", border: "1px solid #222", color: "#ccc", borderRadius: 4, padding: "3px 6px", fontSize: 10, width: "100%", boxSizing: "border-box", outline: "none" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {step.id === "sides" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Minimum 3 different side item types. Tap ✓ / ✗ per criteria.</div>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
              <thead>
                <tr style={{ background: "#1a1a1a" }}>
                  <th style={TH}>Side / Type</th>
                  {SIDE_CRITERIA.map(c => <th key={c.id} style={TH} title={c.desc}>{c.label}</th>)}
                  <th style={{ ...TH, width: 110 }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => {
                  const s = sides[`s${i}`];
                  return (
                    <tr key={i} style={{ background: i % 2 ? "#141414" : "#111" }}>
                      <td style={{ padding: "5px 8px" }}>
                        <input value={s.type} onChange={e => setSides(prev => ({ ...prev, [`s${i}`]: { ...prev[`s${i}`], type: e.target.value } }))}
                          placeholder={`Side ${i+1}`}
                          style={{ background: "transparent", border: "none", color: "#ccc", fontSize: 11, width: "100%", outline: "none" }} />
                      </td>
                      {SIDE_CRITERIA.map(c => (
                        <td key={c.id} style={{ padding: "4px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                            {[["pass","✓","#166534","#86efac"], ["fail","✗","#7f1d1d","#fca5a5"]].map(([v, sym, bg, fg]) => (
                              <button key={v} onClick={() => setSideCell(i, c.id, v)}
                                style={{ width: 34, height: 22, borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 800, background: s[c.id] === v ? bg : "#1e1e1e", color: s[c.id] === v ? fg : "#3a3a3a" }}>
                                {sym}
                              </button>
                            ))}
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: "4px 5px" }}>
                        <input value={s.note} onChange={e => setSides(prev => ({ ...prev, [`s${i}`]: { ...prev[`s${i}`], note: e.target.value } }))}
                          placeholder="note..."
                          style={{ background: "#1a1a1a", border: "1px solid #222", color: "#ccc", borderRadius: 4, padding: "3px 6px", fontSize: 10, width: "100%", boxSizing: "border-box", outline: "none" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {step.points && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 8 }}>CRITERIA</div>
              {step.criteria.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: stepColor, flexShrink: 0, fontSize: 12, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 12, color: "#bbb", lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 18, background: "#181818", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 12 }}>SCORE</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <button onClick={() => upd("pts", Math.max(0, curPts - 1))} style={CTRL_BTN}>−</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: stepColor }}>{curPts}</span>
                  <span style={{ fontSize: 20, color: "#333" }}>/{step.points}</span>
                </div>
                <button onClick={() => upd("pts", Math.min(step.points, curPts + 1))} style={CTRL_BTN}>+</button>
              </div>
              <input type="range" min={0} max={step.points} value={curPts}
                onChange={e => upd("pts", parseInt(e.target.value))}
                style={{ width: "100%", accentColor: stepColor, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444", marginTop: 3 }}>
                <span>0 — fail</span><span>{step.points} — full marks</span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 8 }}>QUICK COMMENTS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {step.comments.map((c, i) => (
                  <button key={i} onClick={() => addQuickComment(c)}
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#999", padding: "5px 10px", borderRadius: 16, cursor: "pointer", fontSize: 11 }}>
                    + {c.length > 50 ? c.slice(0, 48) + "…" : c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 6 }}>NOTES</div>
              <textarea rows={3} value={curComments} onChange={e => upd("comments", e.target.value)}
                placeholder="Observations, coaching notes..."
                style={{ width: "100%", background: "#181818", border: "1px solid #252525", color: "#e8e8e8", borderRadius: 8, padding: "9px 12px", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
            </div>

            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 8 }}>PHOTOS</div>
              <input type="file" accept="image/*" multiple ref={el => fileRefs.current[step.id] = el} onChange={handlePhoto} style={{ display: "none" }} />
              <button onClick={() => fileRefs.current[step.id]?.click()}
                style={{ background: "#181818", border: "1px dashed #2a2a2a", color: "#666", padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 11, marginBottom: 10 }}>
                📷 Add Photo
              </button>
              {curPhotos.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {curPhotos.map((ph, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={ph.url} alt={ph.name} style={{ width: 76, height: 60, objectFit: "cover", borderRadius: 5, border: "1px solid #2a2a2a" }} />
                      <button onClick={() => removePhoto(i)}
                        style={{ position: "absolute", top: -6, right: -6, background: "#b91c1c", border: "none", color: "#fff", borderRadius: "50%", width: 17, height: 17, cursor: "pointer", fontSize: 9, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step.id === "overall" && (
          <div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>Closing coaching notes, commendations, and follow-up items.</div>
            <textarea rows={10} value={overallComment} onChange={e => setOverallComment(e.target.value)}
              placeholder="e.g. Strong dough management and pizza quality observed. Key opportunities: makeline temp compliance, uniform standards..."
              style={{ width: "100%", background: "#181818", border: "1px solid #252525", color: "#e8e8e8", borderRadius: 10, padding: "12px 14px", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
          </div>
        )}

        {step.id === "report" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)", borderRadius: 12, padding: "26px 20px", textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.7, marginBottom: 4 }}>STORE #{storeNum || "—"}</div>
              <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{rating.label}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3 }}>{totalPts()}/{maxPts()} pts · {assessor || "—"} · {visitDate}</div>
              <div style={{ fontSize: 28, marginTop: 10, letterSpacing: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < rating.stars ? "#fff" : "rgba(255,255,255,0.2)" }}>★</span>
                ))}
              </div>
              {Object.values(criticals).filter(Boolean).length > 0 && (
                <div style={{ marginTop: 12, background: "rgba(0,0,0,0.35)", borderRadius: 8, padding: "7px 14px", fontSize: 12 }}>
                  ⚠️ {Object.values(criticals).filter(Boolean).length} Critical Violation{Object.values(criticals).filter(Boolean).length > 1 ? "s" : ""} · −{Object.values(criticals).filter(Boolean).length * 10} pts
                </div>
              )}
            </div>

            <div style={{ background: "#181818", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              {[
                { label: "Pizza", pts: pizzaScore(), max: 28, color: "#dc2626" },
                { label: "Sides", pts: sideScore(),  max: 9,  color: "#dc2626" },
                ...Object.entries(SECTION_META).map(([key, m]) => ({
                  label: m.label, color: m.color,
                  pts: WIZARD_STEPS.filter(s => s.section === key && s.points).reduce((t, s) => t + getStepPts(s), 0),
                  max: WIZARD_STEPS.filter(s => s.section === key && s.points).reduce((t, s) => t + s.points, 0),
                })),
              ].map(row => {
                const p2 = row.max ? Math.round((row.pts / row.max) * 100) : 0;
                return (
                  <div key={row.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "#bbb" }}>{row.label}</span>
                      <span style={{ color: row.color, fontWeight: 700 }}>{row.pts}/{row.max}</span>
                    </div>
                    <div style={{ background: "#252525", borderRadius: 4, height: 7 }}>
                      <div style={{ background: row.color, width: `${p2}%`, height: "100%", borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {incomplete.length > 0 && (
              <div style={{ background: "#78350f", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#fde68a" }}>
                ⚠ {incomplete.length} step{incomplete.length > 1 ? "s" : ""} incomplete — score may be inaccurate.
              </div>
            )}

            <button onClick={emailReport}
              style={{ width: "100%", background: "#b91c1c", border: "none", color: "white", padding: "15px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 800, fontFamily: "inherit", marginBottom: 8 }}>
              📧 Share via Email
            </button>
            <div style={{ fontSize: 10, color: "#444", textAlign: "center" }}>Opens your mail app with full score, section breakdown, pizza/side detail, and all notes.</div>
          </div>
        )}
      </div>

      <div style={{ background: "#111", borderTop: "1px solid #1e1e1e", padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => go(-1)} disabled={stepIdx === 0}
          style={{ ...NAV_BTN, opacity: stepIdx === 0 ? 0.3 : 1 }}>← Back</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, overflow: "hidden" }}>
          {WIZARD_STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStepIdx(i)}
              style={{ width: i === stepIdx ? 14 : 5, height: 5, borderRadius: 3, border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
                background: i === stepIdx ? stepColor : isComplete(s) ? "#1e3a1e" : "#252525", transition: "width 0.15s, background 0.15s" }} />
          ))}
        </div>
        {stepIdx < WIZARD_STEPS.length - 1
          ? <button onClick={() => go(1)} style={{ ...NAV_BTN, background: stepColor, color: "#fff", border: "none", fontWeight: 700 }}>Next →</button>
          : <button onClick={emailReport} style={{ ...NAV_BTN, background: "#b91c1c", color: "#fff", border: "none", fontWeight: 700 }}>📧 Email</button>
        }
      </div>
    </div>
  );
}

const TH = { background: "#1a1a1a", color: "#666", fontSize: 10, fontWeight: 700, padding: "7px 5px", textAlign: "center", borderBottom: "1px solid #222", letterSpacing: 0.5, whiteSpace: "nowrap" };
const CTRL_BTN = { background: "#252525", border: "1px solid #333", color: "#ccc", width: 42, height: 42, borderRadius: 8, cursor: "pointer", fontSize: 22, fontWeight: 300, flexShrink: 0 };
const NAV_BTN = { background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#ccc", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" };
