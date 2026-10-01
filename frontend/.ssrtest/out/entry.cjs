'use strict';

const jsdom = require('jsdom');

async function main() {
  const dom = new jsdom.JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:3000/judge-dashboard",
    pretendToBeVisual: true
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLElement.prototype.scrollIntoView = function() {
  };
  dom.window.HTMLInputElement.prototype.select = function() {
    this.selectionStart = 0;
    this.selectionEnd = 0;
  };
  const React = (await Promise.resolve().then(() => require('./assets/index-h4octwNp.cjs')).then(n => n.React)).default;
  const { createRoot } = await Promise.resolve().then(() => require('./assets/client-D3FfeEPD.cjs')).then(n => n.client);
  const { act } = await Promise.resolve().then(() => require('./assets/test-utils-Dz5_SQw7.cjs')).then(n => n.testUtils);
  const { MemoryRouter } = await Promise.resolve().then(() => require('./assets/index-BvX4B99v.cjs'));
  const JudgeDashboard = (await Promise.resolve().then(() => require('./assets/JudgeDashboard-B2tUiwu6.cjs'))).default;
  const errors = [];
  const origError = console.error;
  console.error = (...args) => {
    errors.push(args.map(String).join(" "));
  };
  const { loadFixtures } = await Promise.resolve().then(() => require('./assets/fixtures-CiMIDh4-.cjs'));
  await loadFixtures();
  console.log("  [harness] fixtures warmed");
  const settle = (container, quietMs = 150, maxMs = 4e3) => act(async () => {
    await new Promise((resolve) => {
      let quietTimer;
      const done = () => {
        observer.disconnect();
        clearTimeout(quietTimer);
        clearTimeout(hardTimer);
        resolve();
      };
      const observer = new dom.window.MutationObserver(() => {
        clearTimeout(quietTimer);
        quietTimer = setTimeout(done, quietMs);
      });
      observer.observe(container, { childList: true, subtree: true, attributes: true, characterData: true });
      const hardTimer = setTimeout(done, maxMs);
      quietTimer = setTimeout(done, quietMs);
    });
  });
  const waitFor = async (container, predicate, maxMs = 8e3) => {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      if (predicate(container)) return true;
      await act(async () => {
        await new Promise((r) => setTimeout(r, 40));
      });
    }
    return false;
  };
  const notLoading = (c) => !(c.textContent || "").includes("Loading dashboard");
  async function run(label, comp, actions) {
    errors.length = 0;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const search = comp === null ? "" : `?comp=${comp}`;
    try {
      await act(async () => {
        root.render(
          React.createElement(
            MemoryRouter,
            { initialEntries: [`/judge-dashboard${search}`] },
            React.createElement(JudgeDashboard)
          )
        );
      });
      await waitFor(container, notLoading);
      await settle(container);
      for (const step of actions) {
        await act(async () => {
          step(container);
        });
        await settle(container);
      }
      const out = container.textContent || "";
      console.log(`
=== ${label} ===`);
      console.log("  rendered chars   :", out.length);
      console.log("  still loading    :", out.includes("Loading dashboard"));
      console.log("  load error banner:", out.includes("Failed to load"));
      const card = out.match(/Teams to review\s*(\S+)/);
      console.log("  Teams to review  :", card ? card[1] : "n/a");
      const unassignedHint = out.includes("Not assigned to you") || out.includes("No team to show in this category");
      const assignedBanner = out.includes("have not been assigned any team yet");
      console.log("  unassigned-team UI present :", unassignedHint);
      console.log('  "not assigned yet" message  :', assignedBanner);
      const cats = [];
      const headings = [...container.querySelectorAll("h3")].map((h) => h.textContent.trim()).filter((t) => t.startsWith("AI for"));
      const empties = [...container.querySelectorAll("p")].filter((p) => p.textContent.includes("No submitted team in this category")).length;
      const onScoreTab = Boolean(container.querySelector("#sort-teams"));
      const onFilesTab = Boolean(container.querySelector("#file-comp-category"));
      console.log("  tab               :", onScoreTab ? "Score Teams" : onFilesTab ? "View Files" : "UNKNOWN");
      console.log("  category headers :", headings.length ? headings.join(" | ") : "none");
      console.log("  empty-category panels:", empties);
      if (process.env.DUMP) console.log("  TEXT >>>", out.replace(/\s+/g, " ").slice(0, 1400));
      const crash = errors.find((e) => /is not a function|is not defined|of null|Cannot read/i.test(e));
      console.log("  crash            :", crash ? crash.slice(0, 400) : "none");
    } catch (err) {
      console.log(`
=== ${label} ===`);
      console.log("  THREW ->", err.message);
      const frames = (err.stack || "").split("\n");
      frames.slice(1, 5).forEach((f) => console.log("   ", f.trim()));
    }
  }
  const clickText = (text) => (c) => {
    const b = [...c.querySelectorAll("button")].find((x) => x.textContent.trim() === text);
    if (b) b.click();
    else console.log(`    (button "${text}" not found)`);
  };
  const setSelect = (label, value) => (c) => {
    const s = c.querySelector(`#${label}`);
    if (!s) return console.log(`    (#${label} not found)`);
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, "value").set;
    setter.call(s, value);
    s.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  };
  await run("files tab (default)", null, []);
  await run("score tab (all categories)", null, [clickText("Score Teams")]);
  await run("score tab + pick Engineering", null, [
    clickText("Score Teams"),
    setSelect("filter-category", "AI for Engineering and Technology")
  ]);
  await run("score tab + pick Entrepreneurship", null, [
    clickText("Score Teams"),
    setSelect("filter-category", "AI for Entrepreneurship")
  ]);
  await run("score tab + pick Social", null, [
    clickText("Score Teams"),
    setSelect("filter-category", "AI for Social Innovation")
  ]);
  await run("score tab + back to all", null, [
    clickText("Score Teams"),
    setSelect("filter-category", "AI for Social Innovation"),
    setSelect("filter-category", "all")
  ]);
  await run("files tab + pick Social (empty)", null, [setSelect("file-comp-category", "AI for Social Innovation")]);
  await run("files tab + pick Engineering", null, [setSelect("file-comp-category", "AI for Engineering and Technology")]);
  async function keyboard(label, steps) {
    errors.length = 0;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
      await act(async () => {
        root.render(React.createElement(
          MemoryRouter,
          { initialEntries: ["/judge-dashboard"] },
          React.createElement(JudgeDashboard)
        ));
      });
      for (let i = 0; i < 40; i++) {
        await act(async () => {
          await new Promise((r) => setTimeout(r, 25));
        });
        if (!(container.textContent || "").includes("Loading dashboard")) break;
      }
      await act(async () => {
        const b = [...container.querySelectorAll("button")].find((x) => x.textContent.trim() === "Score Teams");
        if (b) b.click();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 80));
      });
      const boxes = [...container.querySelectorAll("input[data-score-key]")];
      console.log(`
=== ${label} ===`);
      console.log("  score boxes found:", boxes.length);
      if (!boxes.length) {
        console.log("  crash            : no score inputs rendered");
        return;
      }
      for (const step of steps) {
        await act(async () => {
          step(boxes, container);
        });
        await act(async () => {
          await new Promise((r) => setTimeout(r, 40));
        });
      }
      const active = container.ownerDocument.activeElement;
      console.log("  focus now on     :", active?.getAttribute?.("data-score-key") || active?.tagName);
      const crash = errors.find((e) => /is not a function|is not defined|of null|Cannot read/i.test(e));
      console.log("  crash            :", crash ? crash.slice(0, 400) : "none");
    } catch (err) {
      console.log(`
=== ${label} ===`);
      console.log("  THREW ->", err.message);
    }
  }
  const type = (value) => (boxes) => {
    const el = boxes[0];
    el.focus();
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  };
  const key = (k, opts = {}) => (boxes) => {
    const el = boxes[0].ownerDocument.activeElement;
    el.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: k, bubbles: true, ...opts }));
  };
  await keyboard("type then Enter", [type("25"), key("Enter")]);
  await keyboard("type then Tab", [type("25"), key("Tab")]);
  await keyboard("Shift+Tab", [type("25"), key("Tab", { shiftKey: true })]);
  await keyboard("ArrowRight", [type("25"), key("ArrowRight")]);
  await keyboard("ArrowLeft", [type("25"), key("ArrowLeft")]);
  await keyboard("ArrowDown", [type("25"), key("ArrowDown")]);
  await keyboard("ArrowUp", [type("25"), key("ArrowUp")]);
  await keyboard("Ctrl+ArrowUp", [type("25"), key("ArrowUp", { ctrlKey: true })]);
  await keyboard("Ctrl+Shift+ArrowDown", [type("25"), key("ArrowDown", { ctrlKey: true, shiftKey: true })]);
  await keyboard("out of range then Enter", [type("99"), key("Enter")]);
  await keyboard("non numeric then Enter", [type("2a5"), key("Enter")]);
  await keyboard("walk 4 boxes with Enter", [
    type("25"),
    key("Enter"),
    type("20"),
    key("Enter"),
    type("18"),
    key("Enter"),
    type("12"),
    key("Enter")
  ]);
  console.error = origError;
}
main().then(() => process.exit(0), (e) => {
  console.log("HARNESS FAILED ->", e);
  process.exit(1);
});
