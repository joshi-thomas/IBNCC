
      /* tradingPdDefault */
      (function () {
        var params = new URLSearchParams(window.location.search);
        if (!params.get("product")) {
          var next =
            window.location.pathname + "?product=foam-hat-inserts&cat=home";
          history.replaceState(null, "", next);
        }
      })();
    
