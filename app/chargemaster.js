(function() {
  function configure($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
      .state('home',
        {url: '/home',
        templateUrl: 'app/home.html',
        controller: 'home',
        controllerAs: 'hc'})
      .state('code',
        {url: '/code/:code/:state/:city',
        templateUrl: 'app/code.html',
        controller: 'code',
        controllerAs: 'cc'})
      .state('help',
        {url: '/help/:code/:state/:city',
        templateUrl: 'app/help.html',
        controller: 'help',
        controllerAs: 'helpc'})
      .state('costs',
        {url: '/costs/:code/:state/:city',
        templateUrl: 'app/costs.html',
        controller: 'generic',
        controllerAs: 'costsc'})
  }
  function generic($stateParams) {
    var cc = this;
    cc.code = $stateParams.code;
    cc.city = $stateParams.city;
    cc.state = $stateParams.state;
  }
  function helpController($stateParams, $sce, helpService) {
    var cc = this;
    cc.code = $stateParams.code;
    cc.city = $stateParams.city;
    cc.state = $stateParams.state;
    helpService.fetchHelp(cc.code).then(function(help) {
      cc.help = help;
      cc.help.text = $sce.trustAsHtml(cc.help.text);
    })
  }
  function homeController($scope) {
    var hc = this;
    var populateCity = function() {
      var cities = {};
      angular.forEach(Hospitals, function(value, key) {
        if (this[value.state] === undefined) {
          this[value.state] = [];
        }
        if (this[value.state].indexOf(value.city) === -1) {
          this[value.state].push(value.city)
        }
      }, cities);
      angular.forEach(cities, function(value, key) {
        this[key] = value.sort();
      });
      return cities;
    };
    $scope.cities = populateCity();
    $scope.states = Object.keys($scope.cities).sort();
    hc.selectedState = 'CA';
    $scope.$watch('hc.selectedCity', function(c) {
      if (!c && hc.selectedState) {
        hc.selectedCity = $scope.cities[hc.selectedState][0];
      }
    })
    hc.diagnosisFamilies = diagnosisFamilies;
  }

  function grep(a, f) {
    var rv = [];
    angular.forEach(a, function(v) {
      if (f(v)) {
        rv.push(v);
      }
    })
    return rv;
  }
  
  function codeController($stateParams, codeService) {
    var cc = this;
    cc.hospitals = Hospitals;
    cc.code = $stateParams.code;
    cc.city = $stateParams.city;
    cc.state = $stateParams.state;
    cc.max = 100000;
    codeService.fetchCode($stateParams.code)
      .then(function(drg) {
        cc.drg = drg
        cc.charges = grep(drg.charges,
          function(charge) {
             var hospital = cc.hospitals[charge.hospital];
             return hospital && (hospital.city === $stateParams.city) &&
                 (hospital.state === $stateParams.state)
          })
        cc.max = Number(drg.us_average.chargemaster);
        angular.forEach(cc.charges, function(charge) {
          charge.hospital = cc.hospitals[charge.hospital];
          if (Number(charge.chargemaster) > cc.max) {
            cc.max = Number(charge.chargemaster);
          }
        })
      });
  }
  function codeService($http) {
    return {
      fetchCode: function(code) {
                   return $http({
                     url: './data/2013/drg-' + code + '.json'
                   }).then(function (res) {
                     return res.data;
                   })
                 }
    }
  }
  function helpService($http) {
    return {
      fetchHelp: function(code) {
                   code = 683; //sorry
                   return $http({
                     url: './data/2013/help-' + code + '.json'
                   }).then(function (res) {
                     return res.data;
                   })
                 }
    }
  }
  function chargeBlock() {
    return {
      templateUrl: './app/charge.html',
      controller: function($attrs, $parse, $scope) {
        function getAttr(name) {
          return  $parse($attrs[name])($scope);
        }
        var cbc = this;
        var charge = getAttr('chargeBlock');
        var max = getAttr('chargeBlockMax') / 100;
        cbc.title = charge.hospital.name;
        cbc.stickerPrice = Number(charge.chargemaster) / 100;
        cbc.medicarePrice = Number(charge.medicare) / 100;
        cbc.ratio = cbc.stickerPrice / cbc.medicarePrice;
        cbc.stickerWidth = Math.floor(80 * cbc.stickerPrice / max) + '%';
        cbc.medicareWidth = Math.floor(80 * cbc.medicarePrice / max) + '%';
      },
      controllerAs: 'cbc'
    }
  }
  angular.module('chargemaster', ['ui.router'])
    .config(configure)
    .controller('home', homeController)
    .controller('code', codeController)
    .controller('help', helpController)
    .controller('generic', generic)
    .directive('chargeBlock', chargeBlock)
    .service('codeService', codeService)
    .service('helpService', helpService)
})();
