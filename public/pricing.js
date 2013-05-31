
$(function() {
  var getHash = function() {
    var rv = {};
    $.map(String(window.location.hash).replace(/^#/,'').split('&'),
	  function(s) {
	    var p = $.map(s.split('='), decodeURIComponent);
	    rv[p[0]] = p[1];
	  });
    return rv;
  }

  
  var display = function(drg, city, state) {
    with ($.t) {
      var charges = $.grep(drg.charges, 
			   function(charge) {
			     var hospital = Hospitals[charge.hospital];
			     return (hospital.city.toLowerCase() === city.toLowerCase()) &&
			       (hospital.state.toLowerCase() === state.toLowerCase());
			   });
      var mx = (drg.us_average && drg.us_average.chargemaster) || 0;
      $.map(charges,
	    function(charge) {
	      if (charge.chargemaster > mx) {
		mx = charge.chargemaster;
	      }
	    });

      var asPrice = function(p) {
	return sprintf('$%0.2f', p / 100.0);
      }

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
	return y && sprintf("%0.1fx", x/y);
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
	.append(DIV(HEADER(H2(city, ', ', state),
			   H2(drg.name)),
		    DIV({ clas : 'charge-frame' },
			DIV({ clas : 'charges' },
			    drg.us_average && displayCharge('US Average', drg.us_average),
			    $.map(charges, displayHospitalCharge))),
		    FOOTER(A({ clas : 'unafforable',
			       href : "/public/costs.html"}, 'Help, I cannot afford this'))));
    }
  };

  var h = getHash();
  $.getJSON('/data/drg-' + (h.code || 1) + '.js', function(drg) {
    display(drg, h.city || 'San Francisco', h.state || 'CA');
  });
});