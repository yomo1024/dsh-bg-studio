/**
 * dsh-bg-studio —— 前端。
 *
 * 干三件事：
 *  1. 启动时把「背景图 / 遮罩浓度 / 侧栏字号」写成一个 <style> 注入页面；
 *  2. 在「设置」里注册一个原生分区，让用户上传换图、拖滑杆；
 *  3. 改完立刻生效，不用重启（设置页 <-> 全局样式靠 window 事件同步）。
 *
 * 状态存在 localStorage，键名 dsh-bg-studio:v1。
 *
 * 为什么用独立变量前缀 --bgs-*：
 * better-sidebar 的「自定义 CSS」也在改同一套界面，两套变量各管各的，
 * 用户哪天把 customCss 清空了，这个插件依然独立可用。
 */

window.__ModuleLoader__.load({
  id: "dsh-bg-studio",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");
    var jsxRuntime = require("react/jsx-runtime");
    var jsx = jsxRuntime.jsx;
    var Fragment = jsxRuntime.Fragment;

    var STORAGE_KEY = "dsh-bg-studio:v1";
    var STYLE_ID = "dsh-bg-studio-style";
    var EVENT = "dsh-bg-studio:change";
    var HAS_IMAGE_ATTR = "data-bgs-has-image";

    var DEFAULTS = {
      veil: 55, // 遮罩浓度 0-100：越大越白、图越淡
      title: 12, // 侧栏标题字号
      meta: 11, // 侧栏辅助文字
      time: 10, // 时间戳
      nav: 14, // 顶部导航字号（新会话 / 插件 / 插件市场 …）
      image: "data:image/webp;base64,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" // 内置默认底图（可在设置里换掉）
    };

    var RANGE = {
      veil: [0, 100],
      title: [9, 24],
      meta: [8, 20],
      time: [8, 20],
      nav: [11, 22]
    };

    function clamp(key, value) {
      var range = RANGE[key];
      if (!range) return value;
      return Math.max(range[0], Math.min(range[1], value));
    }

    function readState() {
      var out = Object.assign({}, DEFAULTS);
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return out;
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return out;
        if (typeof parsed.veil === "number") out.veil = clamp("veil", parsed.veil);
        if (typeof parsed.title === "number") out.title = clamp("title", parsed.title);
        if (typeof parsed.meta === "number") out.meta = clamp("meta", parsed.meta);
        if (typeof parsed.time === "number") out.time = clamp("time", parsed.time);
        if (typeof parsed.nav === "number") out.nav = clamp("nav", parsed.nav);
        if (typeof parsed.image === "string") out.image = parsed.image;
      } catch (error) {
        // localStorage 被禁用或数据损坏：退回默认值，不打断界面
      }
      return out;
    }

    function writeState(state) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (error) {
        return false;
      }
    }

    /**
     * 透明化那一段抄自 claude-style 的壁纸模式：
     * 它把几百条 background 都写成 var(--dsh-claude-canvas)，
     * 所以直接把这两个变量改成 transparent，比逐个压 !important 可靠得多。
     *
     * 所有透明规则都挂在 html[data-bgs-has-image] 下 —— 没选图时整段不生效，
     * 界面保持原样，不会出现「白底透了还是白底」的呆样。
     */
    function buildCss(state) {
      var alpha = (state.veil / 100).toFixed(2);
      var lines = [];

      lines.push(":root{");
      lines.push("  --bgs-veil: rgba(252, 252, 251, " + alpha + ");");
      lines.push("  --bgs-title-size: " + state.title + "px;");
      lines.push("  --bgs-meta-size: " + state.meta + "px;");
      lines.push("  --bgs-time-size: " + state.time + "px;");
      lines.push("  --bgs-nav-size: " + state.nav + "px;");
      lines.push(
        "  --bgs-image: " +
          (state.image ? 'url("' + state.image + '")' : "none") +
          ";"
      );
      lines.push("}");

      lines.push("html{background-color:#fcfcfb !important;}");
      lines.push("html[data-bgs-has-image]{");
      lines.push(
        "  background-image: linear-gradient(var(--bgs-veil), var(--bgs-veil)), var(--bgs-image) !important;"
      );
      lines.push("  background-size: cover, cover !important;");
      lines.push(
        "  background-position: center center, center center !important;"
      );
      lines.push("  background-repeat: no-repeat, no-repeat !important;");
      lines.push("  background-attachment: fixed, fixed !important;");
      lines.push("}");

      lines.push(
  'html[data-bgs-has-image] body[data-dsh-claude-style]{'
);
lines.push(
  "  --dsh-claude-fade-stops: transparent 0%, transparent 32%, transparent 100%;"
);
lines.push("}");

lines.push(
        'html[data-bgs-has-image] body[data-dsh-claude-style][data-dsh-claude-palette="claude"],'
      );
      lines.push(
        'html[data-bgs-has-image] body[data-dsh-claude-style][data-dsh-claude-palette="claude"][data-ds-dark-theme]{'
      );
      lines.push("  --dsh-claude-canvas: transparent;");
      lines.push("  --dsh-claude-sidebar-canvas: transparent;");
      lines.push("}");

      lines.push(
        "html[data-bgs-has-image] body,html[data-bgs-has-image] #root{background-color:transparent !important;}"
      );
      lines.push(
        'html[data-bgs-has-image] :is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"],.dshDesktopSidebarSurface){'
      );
      lines.push("  background: transparent !important;");
      lines.push("  --dsw-specific-sidebar-fill: transparent !important;");
      lines.push("}");
      lines.push(
        'html[data-bgs-has-image] :is([data-pane="conversation"],[data-dsh-claude-part~="center-column"],[data-dsh-claude-part~="rightbar-column"]){background: transparent !important;}'
      );
      lines.push(
        'html[data-bgs-has-image] :is([data-dsh-claude-part~="layout-frame"],[data-dsh-claude-holds~="sidebar-column"],[data-dsh-claude-holds~="conversation-scroll"]){background: transparent !important;}'
      );
      lines.push(
        'html[data-bgs-has-image][data-windows-titlebar] [data-dsh-claude-part~="layout-frame"] > [data-dsh-claude-part~="sidebar-column"],html[data-bgs-has-image][data-windows-titlebar] [data-dsh-claude-part~="layout-frame"] > [data-dsh-claude-part~="center-column"]{box-shadow: none !important;}'
      );
      // 思考 / 过程块的白色底。实测来源是 chat 包的 CSS Modules：
      //   ._3GBCTG_root[data-expanded] [data-open] [data-disclosure-header]{
      //     background: var(--dsw-alias-bg-base); position: sticky; }
      // 也就是「展开后的过程块头部」贴了全局白底。这里把几个候选容器
      // 一并清掉，多写几个选择器是因为不同版本换过 data 属性名。
      lines.push(
        'html[data-bgs-has-image] :is([data-disclosure-header],[data-disclosure-body],[data-step-process-body],[data-step-process-content],[data-process-activity],[data-variant="think"]){background: transparent !important;}'
      );
      lines.push(
        'html[data-bgs-has-image] [data-chat-flow-kind="turn-process"]{background: transparent !important;}'
      );

      lines.push(
        "html[data-bgs-has-image] [data-composer-seat]{background: transparent !important;}"
      );
      lines.push(
        "html[data-bgs-has-image] [data-composer-seat]::before{display: none !important;}"
      );

      lines.push(
        ':is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"]) [class*="_title"]:not([class*="hover"]){'
      );
      lines.push("  font-size: var(--bgs-title-size) !important;");
      lines.push(
        "  line-height: calc(var(--bgs-title-size) + 5px) !important;"
      );
      lines.push("}");
      lines.push(
        ':is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"]) [class*="_meta"]{'
      );
      lines.push("  font-size: var(--bgs-meta-size) !important;");
      lines.push("  line-height: calc(var(--bgs-meta-size) + 7px) !important;");
      lines.push("}");
      lines.push(
        ':is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"]) [class*="_time"]{'
      );
      lines.push("  font-size: var(--bgs-time-size) !important;");
      lines.push("  line-height: calc(var(--bgs-time-size) + 5px) !important;");
      lines.push("}");
      lines.push(
        ':is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"]) [class*="_searchResultSnippet"]{'
      );
      lines.push("  font-size: var(--bgs-meta-size) !important;");
      lines.push("  line-height: calc(var(--bgs-meta-size) + 5px) !important;");
      lines.push("}");
      lines.push(
        ':is([data-pane="sidebar"],[data-dsh-claude-part~="sidebar-column"]) [class*="_renameInput"]{'
      );
      lines.push("  font-size: var(--bgs-title-size) !important;");
      lines.push("}");

      // 顶部导航那一列（新会话 / 插件 / 插件市场 / 自动化任务 …）不是会话列表，
      // 它的字号被 DSH 原生侧栏写死在 CSS module 里：`._2H3hWW_root{font-size:14px}`
      // 定底盘，`._2H3hWW_panelRow` 用 `font:inherit` 吃继承，`_panelTitle` 自己不设字号，
      // 所以 fonttune 的「界面字号」轴对这块完全无效（它自己的注释也承认退役了）。
      // 只能直接命中面板项：换字号后按同一比例补行高与最小高，
      // 否则原生写死的 line-height:22px 会把放大的字裁掉。
      lines.push(
        '[class*="_panelList"],[class*="_panelRow"]{font-size: var(--bgs-nav-size) !important;}'
      );
      lines.push(
        '[class*="_panelRow"]{line-height: calc(var(--bgs-nav-size) + 8px) !important;min-height: calc(var(--bgs-nav-size) + 22px) !important;}'
      );
      // 折起来时只藏面板列表本身；「+ 新会话」是 panelList 外面的独立按钮，照常可用。
      lines.push(
        'html[data-bgs-nav-collapsed] [class*="_panelList"]{display:none !important;}'
      );

      return lines.join("\n");
    }

    function render(state) {
      if (typeof document === "undefined") return;
      var style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(style);
      }
      style.textContent = buildCss(state);

      var root = document.documentElement;
      if (root) {
        if (state.image) root.setAttribute(HAS_IMAGE_ATTR, "");
        else root.removeAttribute(HAS_IMAGE_ATTR);
      }
    }

    // ---------------- 设置页控件 ----------------
    var S = {
      card: { display: "flex", flexDirection: "column", gap: "18px" },
      group: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-bg-l2)"
      },
      groupTitle: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--dsw-alias-label-primary)"
      },
      hint: {
        fontSize: "12px",
        lineHeight: "18px",
        color: "var(--dsw-alias-label-tertiary)"
      },
      row: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
      },
      rowLabel: {
        flex: "0 0 104px",
        fontSize: "13px",
        color: "var(--dsw-alias-label-secondary)"
      },
      value: {
        flex: "0 0 52px",
        textAlign: "right",
        fontSize: "12px",
        fontVariantNumeric: "tabular-nums",
        color: "var(--dsw-alias-label-primary)"
      },
      range: { flex: "1 1 auto", accentColor: "#d97757" },
      button: {
        height: "30px",
        padding: "0 12px",
        borderRadius: "8px",
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "var(--dsw-alias-bg-l3)",
        color: "var(--dsw-alias-label-primary)",
        fontSize: "13px",
        cursor: "pointer"
      },
      thumb: {
        width: "100%",
        height: "96px",
        borderRadius: "8px",
        border: "1px solid var(--dsw-alias-border-l2)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "var(--dsw-alias-bg-l1)"
      }
    };

    function Slider(props) {
      return jsx("div", {
        style: S.row,
        children: [
          jsx("div", { style: S.rowLabel, children: props.label }),
          jsx("input", {
            type: "range",
            style: S.range,
            min: props.min,
            max: props.max,
            step: 1,
            value: props.value,
            onChange: function (event) {
              props.onChange(Number(event.target.value));
            }
          }),
          jsx("div", {
            style: S.value,
            children: props.value + (props.unit || "px")
          })
        ]
      });
    }

    function SectionCard() {
      var stateHook = React.useState(readState);
      var state = stateHook[0];
      var setState = stateHook[1];
      var stateRef = React.useRef(state);
      var fileRef = React.useRef(null);
      var errorHook = React.useState("");
      var error = errorHook[0];
      var setError = errorHook[1];

      React.useEffect(function () {
        stateRef.current = state;
      }, [state]);

      function commit(patch) {
        var next = Object.assign({}, stateRef.current, patch);
        stateRef.current = next;
        if (!writeState(next)) {
          setError("保存失败：图片可能太大，localStorage 放不下。");
        } else {
          setError("");
        }
        setState(next);
        try {
          window.dispatchEvent(new window.Event(EVENT));
        } catch (e) {
          render(next);
        }
      }

      function handleFile(event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        setError("正在处理图片…");
        var reader = new FileReader();
        reader.onload = function () {
          var source = String(reader.result || "");
          var image = new window.Image();
          image.onload = function () {
            var maxWidth = 1600;
            var scale = Math.min(1, maxWidth / (image.naturalWidth || maxWidth));
            var width = Math.max(1, Math.round((image.naturalWidth || maxWidth) * scale));
            var height = Math.max(
              1,
              Math.round((image.naturalHeight || 900) * scale)
            );
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            if (context) context.drawImage(image, 0, 0, width, height);

            var dataUrl = "";
            try {
              dataUrl = canvas.toDataURL("image/webp", 0.72);
            } catch (e) {
              dataUrl = "";
            }
            if (!dataUrl || dataUrl === "data:") {
              try {
                dataUrl = canvas.toDataURL("image/jpeg", 0.72);
              } catch (e) {
                dataUrl = "";
              }
            }
            if (!dataUrl || dataUrl === "data:") dataUrl = source;
            commit({ image: dataUrl });
          };
          image.onerror = function () {
            commit({ image: source });
          };
          image.src = source;
        };
        reader.onerror = function () {
          setError("读不了这个文件，换一张试试。");
        };
        reader.readAsDataURL(file);
        event.target.value = "";
      }

      return jsx("div", {
        style: S.card,
        children: [
          jsx("div", {
            style: S.group,
            children: [
              jsx("div", {
                style: S.groupTitle,
                children: "背景图片"
              }),
              jsx("div", {
                style: S.thumb,
                children: null,
                role: "img",
                "aria-label": "背景预览",
                ...(state.image
                  ? { style: Object.assign({}, S.thumb, { backgroundImage: 'url("' + state.image + '")' }) }
                  : {})
              }),
              jsx("div", {
                style: { display: "flex", gap: "8px", alignItems: "center" },
                children: [
                  jsx("input", {
                    ref: fileRef,
                    type: "file",
                    accept: "image/*",
                    style: { display: "none" },
                    onChange: handleFile
                  }),
                  jsx("button", {
                    type: "button",
                    style: S.button,
                    onClick: function () {
                      if (fileRef.current) fileRef.current.click();
                    },
                    children: state.image ? "换一张" : "选择图片"
                  }),
                  state.image
                    ? jsx("button", {
                        type: "button",
                        style: S.button,
                        onClick: function () {
                          commit({ image: "" });
                        },
                        children: "移除"
                      })
                    : null,
                  jsx("span", {
                    style: S.hint,
                    children: error || "支持 JPG / PNG / WebP，图片只存在本机。"
                  })
                ]
              })
            ]
          }),
          jsx("div", {
            style: S.group,
            children: [
              jsx("div", {
                style: S.groupTitle,
                children: "背景浓度"
              }),
              jsx(Slider, {
                label: "遮罩浓度",
                min: 0,
                max: 100,
                value: state.veil,
                unit: "%",
                onChange: function (value) {
                  commit({ veil: value });
                }
              }),
              jsx("div", {
                style: S.hint,
                children: "0% = 图片最清楚，100% = 完全盖住（等于不要背景图）。"
              })
            ]
          }),
          jsx("div", {
            style: S.group,
            children: [
              jsx("div", {
                style: S.groupTitle,
                children: "侧栏字号"
              }),
              jsx(Slider, {
                label: "标题",
                min: RANGE.title[0],
                max: RANGE.title[1],
                value: state.title,
                onChange: function (value) {
                  commit({ title: value });
                }
              }),
              jsx(Slider, {
                label: "辅助文字",
                min: RANGE.meta[0],
                max: RANGE.meta[1],
                value: state.meta,
                onChange: function (value) {
                  commit({ meta: value });
                }
              }),
              jsx(Slider, {
                label: "时间戳",
                min: RANGE.time[0],
                max: RANGE.time[1],
                value: state.time,
                onChange: function (value) {
                  commit({ time: value });
                }
              }),
              jsx(Slider, {
                label: "顶部导航",
                min: RANGE.nav[0],
                max: RANGE.nav[1],
                value: state.nav,
                onChange: function (value) {
                  commit({ nav: value });
                }
              })
            ]
          }),
          jsx("div", {
            style: { display: "flex", justifyContent: "flex-end" },
            children: jsx("button", {
              type: "button",
              style: S.button,
              onClick: function () {
                commit(Object.assign({}, DEFAULTS, { image: state.image }));
              },
              children: "恢复默认数值"
            })
          })
        ]
      });
    }

    // ---------------- 顶部导航折叠 ----------------
    // 原生侧栏只能整条收进 36px 宽的图标 rail（`._2H3hWW_collapsed`），
    // 但下面的文件树还要用，整条收掉不合适。所以这里单独给「新会话 / 插件 /
    // 插件市场 / 自动化任务 …」这一列配一个自己的开关：在 panelList 前面插一行
    // 「▾ 导航」，点一下只收这一列，文件树与「+ 新会话」都原地不动。
    //
    // 为什么插 DOM 而不是纯 CSS：CSS 没有可点的状态，除非改 React 树——
    // 而我们只往 panelList 的父容器前面插一个兄弟节点，不碰 React 自己的节点；
    // 万一侧栏重渲染把它冲掉，MutationObserver 会在 120ms 后重新插回来。
    var NAV_COLLAPSED_KEY = "dsh-bg-studio:nav-collapsed";
    var NAV_TOGGLE_ATTR = "data-bgs-nav-toggle";
    var NAV_COLLAPSED_ATTR = "data-bgs-nav-collapsed";

    function navCollapsed() {
      try {
        return window.localStorage.getItem(NAV_COLLAPSED_KEY) === "1";
      } catch (error) {
        return false;
      }
    }

    function paintNavToggle(btn) {
      var collapsed = navCollapsed();
      var root = document.documentElement;
      if (root) {
        if (collapsed) root.setAttribute(NAV_COLLAPSED_ATTR, "");
        else root.removeAttribute(NAV_COLLAPSED_ATTR);
      }
      if (!btn) return;
      btn.textContent = collapsed ? "▸ 导航" : "▾ 导航";
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      btn.setAttribute("aria-label", collapsed ? "展开顶部导航" : "收起顶部导航");
    }

    function toggleNav() {
      var next = !navCollapsed();
      try {
        window.localStorage.setItem(NAV_COLLAPSED_KEY, next ? "1" : "0");
      } catch (error) {
        // 存不下也不拦着用，只是刷新后记不住
      }
      paintNavToggle(document.querySelector("[" + NAV_TOGGLE_ATTR + "]"));
    }

    function ensureNavToggle() {
      if (typeof document === "undefined" || !document.body) return;

      var mounted = document.querySelector("[" + NAV_TOGGLE_ATTR + "]");
      if (mounted && document.contains(mounted)) {
        paintNavToggle(mounted);
        return;
      }

      var list = document.querySelector('[class*="_panelList"]');
      if (!list || !list.parentElement) return;
      var host = list.parentElement;

      var btn = document.createElement("button");
      btn.setAttribute(NAV_TOGGLE_ATTR, "");
      btn.type = "button";
      btn.setAttribute(
        "style",
        "display:flex;align-items:center;justify-content:flex-start;" +
          "width:100%;flex:none;padding:2px 8px;margin:0 2px 2px;" +
          "background:none;border:none;border-radius:6px;cursor:pointer;" +
          "font:inherit;font-size:11px;line-height:1.7;letter-spacing:.06em;" +
          "opacity:.55;text-align:left;"
      );
      btn.addEventListener("mouseenter", function () {
        btn.style.opacity = "1";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.opacity = ".55";
      });
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleNav();
      });

      host.insertBefore(btn, list);
      paintNavToggle(btn);
    }

    // ---------------- 插件入口 ----------------
    var inject = ["slots"];

    function apply(ctx) {
      render(readState());
      // 先把「折叠」属性打到 <html> 上：刷新后若是收着的状态，
      // 别等 300ms 后按钮插进来才收，否则会闪一下。
      paintNavToggle(null);

      var sync = function () {
        render(readState());
      };
      window.addEventListener(EVENT, sync);
      ctx.effect(function () {
        return function () {
          window.removeEventListener(EVENT, sync);
        };
      }, "dsh-bg-studio: settings sync");

      // 导航折叠：先插一次（侧栏可能还没渲染出来，所以留个延迟重试），
      // 再用 MutationObserver 兜住侧栏重渲染 —— 按钮被 React 冲掉就补回来。
      var navTimer = 0;
      var scheduleEnsure = function () {
        if (navTimer) return;
        navTimer = window.setTimeout(function () {
          navTimer = 0;
          ensureNavToggle();
        }, 120);
      };
      window.setTimeout(ensureNavToggle, 300);
      window.setTimeout(ensureNavToggle, 1200);
      var navObserver = new MutationObserver(scheduleEnsure);
      navObserver.observe(document.body, { childList: true, subtree: true });
      ctx.effect(function () {
        return function () {
          navObserver.disconnect();
          if (navTimer) window.clearTimeout(navTimer);
          var btn = document.querySelector("[" + NAV_TOGGLE_ATTR + "]");
          if (btn) btn.remove();
        };
      }, "dsh-bg-studio: nav toggle");

      ctx.slots.inject("settings.section", function () {
        try {
          var unregister = ctx.slots.register(
            {
              name: "settings.section",
              id: "dsh-bg-studio",
              order: 900,
              label: function () {
                return "背景与字号";
              }
            },
            SectionCard
          );
          return function () {
            unregister();
          };
        } catch (error) {
          return function () {};
        }
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
