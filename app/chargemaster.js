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
        {url: '/help',
        templateUrl: 'app/help.html',
        controller: 'help',
        controllerAs: 'hc'})
      .state('costs',
        {url: '/costs',
        templateUrl: 'app/costs.html',
        controller: 'costs',
        controllerAs: 'cc'})
  }
  function nothing() {};
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
    codeService.fetchCode($stateParams.code)
      .then(function(drg) {
        cc.drg = drg
        cc.charges = grep(drg.charges,
          function(charge) {
             var hospital = cc.hospitals[charge.hospital];
             return hospital && (hospital.city === $stateParams.city) &&
                 (hospital.state === $stateParams.state)
          })
        angular.forEach(cc.charges, function(charge) {
          charge.hospital = cc.hospitals[charge.hospital];
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
  function chargeBlock() {
    return {
      templateUrl: './app/charge.html',
      controller: function($attrs, $parse, $scope) {
        function getAttr(name) {
          return  $parse($attrs[name])($scope);
        }
        var cc = this;
        var charge = getAttr('chargeBlock');
        var max = 100000;
        cc.title = charge.hospital.name;
        cc.stickerPrice = Number(charge.chargemaster) / 100;
        cc.medicarePrice = Number(charge.medicare) / 100;
        cc.ratio = cc.stickerPrice / cc.medicarePrice;
        cc.stickerWidth = Math.floor(80 * cc.stickerPrice / max) + '%';
        cc.medicareWidth = Math.floor(80 * cc.medicarePrice / max) + '%';
      },
      controllerAs: 'cc'
    }
  }
  angular.module('chargemaster', ['ui.router'])
    .config(configure)
    .controller('home', homeController)
    .controller('code', codeController)
    .controller('help', nothing)
    .controller('costs', nothing)
    .directive('chargeBlock', chargeBlock)
    .service('codeService', codeService)
})();
