export function initAnalytics() {
  // Use requestIdleCallback to not block the main thread (PageSpeed optimization)
  const init = () => {
    // --- Sentry Error Tracking ---
    if (window.Sentry) {
      window.Sentry.init({
        dsn: "https://e9316799db954e62b4d4a7911d1207c2@o4512017861967873.ingest.us.sentry.io/4512017910857728",
        tracesSampleRate: 1.0,
      });
    }

    // --- Mixpanel Analytics Loader ---
    (function (f, b) {
      if (!b.__SV) {
        var e, g, i, h;
        window.mixpanel = b;
        b._i = [];
        b.init = function (e, f, c) {
          function g(a, d) {
            var b = d.split(".");
            2 == b.length && ((a = a[b[0]]), (d = b[1]));
            a[d] = function () {
              a.push([d].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          var a = b;
          "undefined" !== typeof c ? (a = b[c] = []) : (c = "mixpanel");
          a.people = a.people || [];
          a.toString = function (a) {
            var d = "mixpanel";
            "mixpanel" !== c && (d += "." + c);
            a || (d += " (stub)");
            return d;
          };
          a.people.toString = function () {
            return a.toString(1) + ".people (stub)";
          };
          i = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
            " "
          );
          for (h = 0; h < i.length; h++) g(a, i[h]);
          var j = "set set_once union unset remove delete".split(" ");
          a.get_group = function () {
            function b(c) {
              d[c] = function () {
                var call2_args = arguments;
                var call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                a.push([e, call2]);
              };
            }
            for (
              var d = {},
                e = ["get_group"].concat(Array.prototype.slice.call(arguments, 0)),
                c = 0;
              c < j.length;
              c++
            )
              b(j[c]);
            return d;
          };
          b._i.push([e, f, c]);
        };
        b.__SV = 1.2;
        e = f.createElement("script");
        e.type = "text/javascript";
        e.async = !0;
        e.src =
          "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL
            ? MIXPANEL_CUSTOM_LIB_URL
            : "file:" === f.location.protocol &&
              "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)
            ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
            : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
        g = f.getElementsByTagName("script")[0];
        g.parentNode.insertBefore(e, g);
      }
    })(document, window.mixpanel || []);

    // Fetch mixpanel config from backend
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.mixpanelToken) {
          mixpanel.init(data.mixpanelToken, {
            debug: false,
            track_pageview: true,
            persistence: "localStorage",
          });
          
          let userId = localStorage.getItem("arena_user_id");
          let userEmail = localStorage.getItem("arena_user_email");
          
          if (userId) {
            mixpanel.identify(userId);
            if (userEmail) {
              mixpanel.people.set({
                "$email": userEmail,
                "$last_login": new Date().toISOString()
              });
            }
          }
        }
      })
      .catch((err) => console.error("Erro ao configurar Analytics", err));
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(init);
  } else {
    setTimeout(init, 1);
  }
}

export function trackEvent(eventName, properties = {}) {
  if (window.mixpanel && typeof window.mixpanel.track === "function") {
    window.mixpanel.track(eventName, properties);
  }
}
