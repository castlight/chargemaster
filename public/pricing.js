
$(function() {

  var back = function(e) {
    e.preventDefault();
    window.history.go(-1);
  };

  var addCommas = function(n) {
    var addCommas3 = function(s) {
      return s.length > 3 ? (addCommas3(s.substring(0, s.length-3)) 
                             + ',' + s.substring(s.length-3)) : s;
    };

    return (n < 10000) ? String(n) : addCommas3(String(n));
  };

  var asPrice = function(p) {
    return '$' + addCommas(Math.floor(p / 100.0));
  };

  var asRatio = function(x, y) {
    return String(Math.floor((x * 10) / y) / 10) + 'x';
  };
  
  var renderAllCharges = function(drg, city, state) {
    with ($.t) {
      var charges = $.grep(drg.charges, 
			   function(charge) {
			     var hospital = Hospitals[charge.hospital];
			     return hospital &&
			       (hospital.city.toLowerCase() === city.toLowerCase()) &&
			       (hospital.state.toLowerCase() === state.toLowerCase());
			   });
      var mx = (drg.us_average && drg.us_average.chargemaster) || 0;
      $.map(charges,
  	    function(charge) {
  	      if (charge.chargemaster > mx) {
  		      mx = charge.chargemaster;
  	      }
  	    });

      var priceLine = function(name, price, clas, label) {
        width = Math.floor(80 * price / mx) + '%';

      	return DIV({ clas : 'price-line ' + clas },
      		   DIV({ clas : 'price-name' }, name),
      		   DIV({ clas : 'price-bar-frame' },
      		       DIV({ clas : 'price-bar',
      			     style : {
      			       width : width
      			     }
      			   },
      			   label && DIV({ clas : 'price-bar-label'}, label)),
      		       SPAN({ clas : 'price' },
      			    asPrice(price))));
            };

      var computeRatio = function(x, y) {
        return y && asRatio(x, y);
      };


      var displayCharge = function(title, charge) {
        var label = computeRatio(charge.chargemaster, charge.medicare);
        return DIV({ clas : 'charge' },
    		   H4(title),
    		   DIV({ clas : 'price-block' },
    		       priceLine('Sticker Price', charge.chargemaster, 'chargemaster', label),
    		       priceLine('Medicare Price', charge.medicare, 'medicare')));
          };

      var displayHospitalCharge = function(charge) {
      	return displayCharge(Hospitals[charge.hospital].name,
      			     charge);
            };

      $('body').empty()
      	.append(DIV(HEADER(A({ clas : 'back-button',
      			       href: '#'}).click(back),
      			   H2(city, ', ', state),
      			   H2(drg.name),
      			   A({ clas : 'help-button',
      			       href: '#page=help'})),
      		    DIV({ clas : 'charge-frame' },
      			DIV({ clas : 'charges' },
      			    drg.us_average && displayCharge('US Average', drg.us_average),
      			    $.map(charges, displayHospitalCharge))),
      		    FOOTER(A({ clas : 'unafforable',
      			       href : "#costs"}, 'Help, I cannot afford this'))));
          }
        };

  var renderHelp = function() {
    with ($.t) {
      $('body')
        .empty()
        .append(DIV(HEADER(A({ "class": "back-button", href: "#" }).click(back),
                           H2("Renal Failure")),
                    DIV( { style: { position: "absolute", top:px(80) } },
                         DIV(IMG({ src: "public/kidney-topimage.png", style: {display: "block",  margin: "0 auto" } }), 
                             DIV( { style: "width:85%;margin:10px;" },
                                  P("Kidney failure, or renal failure, describes a situation in which one's kidneys are no longer able to adequately clean waste from the blood. This can lead to a number of symptoms caused by an increase of waste in the blood, such as nausea, urination issues, or swelling of the hands, feet, and face." ), 
                                  P("While kidney failure is usually not reversible, it is often controlled by a treatment called dialysis. In this treatment, a special machine functions as a filter to clear wastes from the blood. Dialysis is typically completed several times per week and lasts for several hours."), 
                                  P("In some cases, kidney transplants are available to replace a poorly functioning kidney with a healthy kidney."))))));
    }
  };


  var retrieveCharges = function(code, city, state) {
    $.getJSON('data/drg-' + code + '.js', function(drg) {
      renderAllCharges(drg, city, state)
    }).fail(function() {
      renderAllCharges({charges : [], name : "Not found" }, city, state);
    });
  };

  var renderCostSavings = function() {
    with ($.t) {
      $('body')
        .empty()
        .append(DIV(HEADER(A({ "class": "back-button", href: "#"}).click(back),
                           H2("How to help lower your costs")),
                    DIV({ style: { position: "absolute", top:px(80), overflow:"auto" }},
  	                DIV(IMG( { src: "public/help-topimage.png", style: { display: "block", margin: "0 auto"} } ),

                            DIV( { style: { width:"85%", margin:px(10) } },
	                         P("If you don't have insurance or have limited insurance, there are a couple of approaches you might consider to help you pay for your medical need."),
	                         OL(
		                   LI(STRONG("Evaluate the hospitals in your area for cost effectiveness"),
                                      P("This database will allow you to search for the 'Sticker Price' (the amount a hospital charges for a specific procedure) and the average amount paid by Medicare (the amount Medicare actually reimburses the hospital). Hospitals with lower charges will generally be more reasonably priced for you if you are paying on your own.")),
		                   LI(STRONG("Negotiate your payment in advance"),
                                      P("Most hospitals will offer you a \"Cash Pay\" or \"Self-pay\" price when you schedule an expensive procedure.  Usually, that price is a 30% or 40% from their normally charged price. Sounds good, right? Nope! The data in this application shows that the 'Sticker Price' is often 5 or even 10 times what Medicare pays. So, when you negotiate, make sure you get a deal that is around or less than the Medicare paid amount.")),
		                   LI(STRONG("Get help negotiating your hospital bill -- visit Medical Billing Advocates of America:"),
			              UL({ "class": "disc" },
			                  LI("Go to ", A({ href: "http://www.billadvocates.com"},"http://www.billadvocates.com")),
			                  LI("Click on \"Find a Medical Bill Advocate\" and fill out your information"),
			                  LI("Someone will get back to you with suggestions on advocates in your area")))))))));
    }
  };

  var toggle = function($accordion) {
    return function() {
      var $section = $(this);
      var visible = !$section.is(".current");
      $accordion.find(".section_body").hide();
      $section.parent().find(".section_body").toggle(visible);
      $section.toggleClass("current", visible);
    };
  };

  var populateState = function($state) {
    $state.append($.map($.unique($.map(Hospitals, function(h) { return h.state; } ).sort()).sort(),
           function(state) {
             return $.t.OPTION({ value : state }, state);
           }));
  };
  
  var populateCity = function($city, state) {
    $city.empty()
      .append($.map($.unique($.map($.grep($.map(Hospitals, function(h) { return h; } ), 
                                          function(h) {
                                            return h.state === state
                                          }),
                                   function(h) {
                                     return h.city;
                                   }).sort()).sort(),
                    function(city) {
                      return $.t.OPTION({ value : city }, city);
                    }));
  };


  var lastCity = "San Francisco";
  var lastState = "CA";

  var renderHome = function() {
    with ($.t) {
      var $drgs, $city = SELECT(), $state = SELECT({ style : { width : px(60)}});
      $('body')
        .empty()
        .append(DIV(DIV({ "class": "row", style: { background:"url(public/home-topimage.png)",  width: "99%", height: px(213)}},
                        P({ "class": "strong", style: { padding: "60px 0 0 10px"}}, "What does your hospital charge?"), 
                        FORM($city, $state)), 
                    $drgs = DIV({ "data-accordion":"", "class": "cl_accordion", style : { margin : "0 10px" } } )));

      populateState($state);
      populateCity($city, lastState);
      $state.change(function() {
        populateCity($city, $state.val());
      }).val(lastState);

      $city.val(lastCity);
                
      var sortByName = function(a, b) { /* "Other" comes last */
        return (a.name === 'Other') ? 1 : ((b.name === 'Other') ? -1 :
                                            (a.name === b.name ? 0 : ((a.name > b.name) ? 1 : -1 )));
      };

      $.getJSON('data/drgs.json', function(drgs) {
        $.map(drgs.sort(sortByName),
              function(mrg) {
                $drgs.append(DIV( { "class": "section"},
                                    DIV( { "class": "section_header", style: { padding: "5px 5px 25px 5px",  background: "#eee4d4"}},
                                         DIV({ "class": "accordion_title_left"},  mrg.name )).click(toggle($drgs)),
                                    DIV({ "class": "section_body", style: { padding: px(10)}},
                                        $.map(mrg.DRGs.sort(sortByName), function(drg) {
                                          return H3(A(function() { window.location.hash = "code/" + drg.code + 
                                                                   "?city=" + $city.val() +
                                                                   "&state=" + $state.val();
                                                                 },
                                                      { rel: "detail",
                                                        style: { color:"#12778e" }}, 
                                                      drg.name ));
                                        }))));
              });
      });
    }
  };

  jHash.route('code/{code}',
              function() {
                lastCity = jHash.val().city || "San Francisco";
                lastState = jHash.val().state || "CA";
                retrieveCharges(this.code || 1, lastCity, lastState);
              });

  jHash.route('help',renderHelp);

  jHash.route('costs', renderCostSavings);

  jHash.route('', renderHome);

  jHash.processRoute();
});