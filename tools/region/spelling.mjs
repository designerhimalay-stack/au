// US spelling at build time. The copy is written once in Australian English;
// the US build rewrites it module by module, so every repo shares one source.
// Protected (never rewritten): string literals that are a single slug, id, or
// path ("sec-datacentre", "/images/x.jpg"), and any run containing "/" (URLs,
// template paths). Identifiers are renamed consistently in every source file,
// so a key like `centre` still matches across modules.

/** Australian → US. Lower-case stems; inflections are listed explicitly. */
const WORDS = {
  adviser: "advisor", advisers: "advisors",
  analyse: "analyze", analysed: "analyzed", analyses: "analyzes", analysing: "analyzing",
  authorisation: "authorization", authorised: "authorized", unauthorised: "unauthorized",
  behaviour: "behavior", behaviours: "behaviors",
  catalogue: "catalog", catalogues: "catalogs",
  centralise: "centralize", centralised: "centralized", centralises: "centralizes",
  centre: "center", centres: "centers", datacentre: "datacenter",
  colour: "color", colours: "colors",
  containerisation: "containerization", containerised: "containerized",
  customisable: "customizable", customisation: "customization", customise: "customize", customised: "customized",
  defence: "defense",
  digitalisation: "digitalization",
  favour: "favor",
  itemised: "itemized",
  judgement: "judgment",
  labelled: "labeled",
  labour: "labor",
  licence: "license", licences: "licenses",
  mobilisation: "mobilization", mobilising: "mobilizing",
  modelled: "modeled", modelling: "modeling",
  modernisation: "modernization", modernise: "modernize", modernised: "modernized", modernises: "modernizes", modernising: "modernizing",
  normalise: "normalize",
  operationalise: "operationalize",
  optimisation: "optimization", optimise: "optimize", optimised: "optimized", optimises: "optimizes", optimising: "optimizing",
  organisation: "organization", organisations: "organizations", organised: "organized", organiser: "organizer", organises: "organizes",
  personalisation: "personalization", personalised: "personalized", personalising: "personalizing",
  prioritise: "prioritize", prioritises: "prioritizes",
  programme: "program", programmes: "programs",
  specialise: "specialize", specialised: "specialized",
  standardise: "standardize", standardises: "standardizes",
  strategise: "strategize",
  summarise: "summarize", summarising: "summarizing",
  synchronise: "synchronize",
  travelling: "traveling",
  utilisation: "utilization",
  visualisation: "visualization", visualisations: "visualizations", visualising: "visualizing",
  ageing: "aging",
};

const WORD_RE = new RegExp(`(?<![A-Za-z])(${Object.keys(WORDS).join("|")})(?![A-Za-z])`, "gi");

function swap(word) {
  const us = WORDS[word.toLowerCase()];
  if (word === word.toUpperCase()) return us.toUpperCase();
  if (word[0] === word[0].toUpperCase()) return us[0].toUpperCase() + us.slice(1);
  return us;
}

// Slug-like string literals, and any non-space run that contains a slash.
// A one-word literal is copy ("Optimise"); one with - . : # $ is an id or path.
const PROTECT_RE = /(["'`])[\w.${}:#-]*[.${}:#-][\w.${}:#-]*\1|[^\s"'`<>()]*\/[^\s"'`<>()]*/g;

/** Rewrite Australian spellings in one source file. */
export function toUS(code) {
  let out = "";
  let last = 0;
  for (const m of code.matchAll(PROTECT_RE)) {
    out += code.slice(last, m.index).replace(WORD_RE, swap) + m[0];
    last = m.index + m[0].length;
  }
  return out + code.slice(last).replace(WORD_RE, swap);
}

/** Vite plugin: applies toUS to every source module under /src/. */
export function usSpelling() {
  return {
    name: "region-us-spelling",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0].replace(/\\/g, "/");
      if (!file.includes("/src/") || !/\.(ts|tsx|astro)$/.test(file)) return null;
      return { code: toUS(code), map: null };
    },
  };
}
