(function () {
  'use strict';

  angular.module('populationioApp')

    .controller('MainCtrl', function ($scope, $timeout, $interval, $rootScope, $modal, $state, $location, $document, ProfileService, PopulationIOService) {

      $scope.profile = ProfileService;
      $scope.shareUrl = $location.absUrl();
      $scope.worldPopulation = PopulationIOService.getWorldPopulation();

      $rootScope.$on('duScrollspy:becameActive', function ($event, $element) {
        var hash = $element.prop('id');
        if (hash) {
          if (hash.indexOf('stats') > -1) {
            $rootScope.currentPage = 0;
            return;
          } else {
            $rootScope.currentPage = 99;
          }
          var path = $location.$$path.replace(/[^/]*$/g, '');
          $location.path(path + hash).replace();
          $rootScope.$apply();
        }
      });

      $timeout(function () {
        var path = $location.$$path.replace(/.+[/](.*)$/g, '$1'),
          section = angular.element(document.getElementById(path));
        if ($rootScope.currentPage > 1) {
          $document.scrollToElement(section, 80, 1000).then(function () {
            console.log('done');
          });
        }
      }, 500);

      $scope.$watch(function () {
        return $location.absUrl();
      }, function (url) {
        $scope.shareUrl = url;
      });

      $interval(function () {
        $scope.worldPopulation = PopulationIOService.getWorldPopulation();
      }, 1000);

      $rootScope.$on('$stateChangeStart', function (e, toState) {
        $scope.state = toState.name;
      });

      $scope.showHomepage = function () {
        var section = angular.element(document.getElementById('stats'));
        $document.scrollToElement(section, 80, 1000);
      };

      $scope.showAbout = function() {
        $modal.open({
          templateUrl: 'about.html'
        });
      };

      $scope.showDevelopers = function() {
        $modal.open({
          templateUrl: 'developers.html'
        });
      };
    })

    .controller('StatsCtrl', function ($scope, $document, $timeout, $filter, $location, $rootScope, ProfileService, PopulationIOService) {

      $scope.$watch('goForm.$invalid', function (invalid) {
        if (invalid) {
          ProfileService.active = false;
          $location.path('');
        }
      });

      $scope.goGoGadget = function () {
        $scope.loading = true;
        $timeout(function () {
          $scope.loading = false;
          ProfileService.active = true;

          var year = $filter('date')(ProfileService.birthday, 'yyyy'),
            month = $filter('date')(ProfileService.birthday, 'MM'),
            day = $filter('date')(ProfileService.birthday, 'dd');

          $location.path([
            year,
            month,
            day,
            ProfileService.country,
            'people'
          ].join('/'));

          var section = angular.element(document.getElementById('people'));
          $document.scrollToElement(section, 80, 1000);
        }, 1000);
      };

      $scope.$watch(function () {
        return ProfileService.loading;
      }, function (value) {
        $scope.loading = value;
      });

      $scope.countries = [];
      PopulationIOService.loadCountries(function (countries) {
        $scope.countries = countries;
      });
    })

    .controller('PeopleCtrl', function ($scope, $anchorScroll, $state, $filter, PopulationIOService, ProfileService, $rootScope, $interval) {

      $scope.$watch(function () {
        return ProfileService.active;
      }, function (active) {
        if (active) {
          _update();
        }
      });

      var _update = function () {
        PopulationIOService.loadWpRankToday({
          dob: ProfileService.birthday,
          sex: ProfileService.gender,
          country: ProfileService.country
        }, function (rank) {
          $scope.rankLocal = rank;
        });

        PopulationIOService.loadWpRankToday({
          dob: ProfileService.birthday,
          sex: ProfileService.gender,
          country: 'World'
        }, function (rank) {
          $scope.rankGlobal = rank;
        });
      };
    })

    .controller('StoryCtrl', function ($scope, $rootScope, $state, $filter, $sce, ProfileService, PopulationIOService) {

      var _getDateWithOffset = function (date, offset) {
        var year = parseInt($filter('date')(date, 'yyyy'), 0),
          month = $filter('date')(date, 'MM'),
          day = $filter('date')(date, 'dd');

        return new Date(parseInt(year + offset, 0), month, day);
      };

      $scope.year = $filter('date')(new Date(), 'yyyy');
      $scope.storyLineData = [];

      var _loadLifeExpectancyTotal = function (country) {
        PopulationIOService.loadLifeExpectancyTotal({
          sex: ProfileService.gender,
          country: country,
          dob: ProfileService.birthday
        }, function (totalLifeExpectancy) {
          $scope.storyLineData.push({
            date: $filter('date')(_getDateWithOffset(new Date(ProfileService.birthday), totalLifeExpectancy), 'yyyy-MM-dd'),
            year: $filter('date')(_getDateWithOffset(new Date(ProfileService.birthday), totalLifeExpectancy), 'yyyy'),
            title: 'Life expectancy in ' + country
          });
        });
      };

      var _loadWpRankRanked = function (rank, atomicNumber, onSuccess) {
        PopulationIOService.loadWpRankRanked({
          dob: ProfileService.birthday,
          sex: ProfileService.gender,
          country: 'World',
          rank: rank
        }, function (date) {
          $scope.storyLineData.push({
            date: date,
            year: $filter('date')(date, 'yyyy'),
            title: atomicNumber + ' billion person'
          });
          if (onSuccess) {
            onSuccess(date);
          }
        });
      };

      $scope.highlightStoryLine = function (year) {
        $scope.selectedYear = year;
      };

      $scope.$watch(function () {
        return ProfileService.active;
      }, function (active) {
        if (active) {
          _update();
        }
      });

      var _update = function () {
        PopulationIOService.loadPopulation({
          year: $filter('date')(new Date(), 'yyyy'),
          country: ProfileService.country
        }, function (data) {
          $scope.localRankData = data;
        });

        PopulationIOService.loadPopulation({
          year: $filter('date')(new Date(), 'yyyy'),
          country: 'World'
        }, function (data) {
          $scope.globalRankData = data;
        });

        // TODO: refactor me, duplicate code, people controller
        PopulationIOService.loadWpRankToday({
          dob: ProfileService.birthday,
          sex: ProfileService.gender,
          country: ProfileService.country
        }, function (rank) {
          $scope.rankLocal = rank;
        });

        PopulationIOService.loadWpRankToday({
          dob: ProfileService.birthday,
          sex: ProfileService.gender,
          country: 'World'
        }, function (rank) {
          $scope.rankGlobal = rank;
        });

        _loadWpRankRanked(1000000000, '1th');
        _loadWpRankRanked(2000000000, '2th');
        _loadWpRankRanked(3000000000, '3th', function (date) {
          $scope.title = $sce.trustAsHtml([
            'Watch out on <span>',
              $filter('ordinal')($filter('date')(date, 'd')) + ' ',
              $filter('date')(date, 'MMM, yyyy') + '</span> becoming ',
            'the <span>3th Billion</span> person on earth!'
          ].join(''));
        });

        _loadLifeExpectancyTotal(ProfileService.country);
        _loadLifeExpectancyTotal('World');

        $scope.country = ProfileService.country;

        $scope.storyLineData = [
          {
            date: $filter('date')(Date.now(), 'yyyy-MM-dd'),
            year: $filter('date')(Date.now(), 'yyyy'),
            title: 'Now',
            now: true
          },
          {
            date: ProfileService.birthday,
            year: $filter('date')(new Date(ProfileService.birthday), 'yyyy'),
            title: 'Born',
            born: true
          },
          {
            date: _getDateWithOffset(new Date(ProfileService.birthday), 18),
            year: $filter('date')(_getDateWithOffset(new Date(ProfileService.birthday), 18), 'yyyy'),
            title: 'You turned 18!'
          }
        ];
      };
    })

    .controller('BirthdaysCtrl', function ($scope, $state, $sce, $filter, $rootScope, PopulationIOService, ProfileService) {

      $scope.$watch(function () {
        return ProfileService.active;
      }, function (active) {
        if (active) {
          _update();
        }
      });

      var _loadPopulation = function(args, onSuccess) {
        PopulationIOService.loadPopulation({
          year: $filter('date')(Date.now(), 'yyyy'),
          country: args.country
        }, function (data) {
          onSuccess(args.country, data[0]);
        });
      };

      var countries = [];
      d3.csv('scripts/data/country_continent.csv', function(data) {
        countries = data;
      });

      var _getCountry = function(name) {
        for (var i=0; i<countries.length; i+=1) {
          var country = countries[i];
          if (country.country === name) {
            return country;
          }
        }
      };

      var _getCountriesByContinent = function(continent) {
        var res = [];
        for (var i=0; i<countries.length; i+=1) {
          var country = countries[i];
          if (country.continent === continent) {
            res.push(country);
          }
        }
        return res.length > 20 ? res.splice(0,19) : res;
      };

      $scope.continentsData = [];
      $scope.worldData = [];
      $scope.selectedContinental = 'Asia';

      $scope.$watch('selectedContinental', function(newValue, oldValue) {
        if (oldValue !== newValue) {
          _updateContinentalCountries();
        }
      });

      var _updateContinentalCountries = function() {
        $scope.loading = true;
        $scope.continentsData = [];

        var countriesContinental = _getCountriesByContinent($scope.selectedContinental);
        var responseCounter = 0;

        for (var j=0; j<countriesContinental.length; j+=1) {
          _loadPopulation({
            country: countriesContinental[j].country,
            age: ProfileService.getAge()
          }, function(country, data) {
            if (_getCountry(country).countriy_ISO_A2) {
              var value = ProfileService.gender === 'male' ? data.males : data.females;
              $scope.continentsData.push({
                countryAbbr: _getCountry(country).countriy_ISO_A2,
                countryTitle: country,
                value: value/365/24
              });
            }
            if (++responseCounter === countriesContinental.length) {
              $scope.loading = false;
            }
          });
        }
      };

      var _update = function () {
        $scope.worldData = [];

        var countriesAroundTheWorld = [
          'China', 'India', 'USA', 'Indonesia', 'Brazil',
          'Pakistan', 'Russia', 'Japan', 'Nigeria',
          'Bangladesh', 'Mexico'
        ];

        for (var i=0; i<countriesAroundTheWorld.length; i+=1) {
          _loadPopulation({
            country: countriesAroundTheWorld[i],
            age: ProfileService.getAge()
          }, function(country, data) {
            var value = ProfileService.gender === 'male' ? data.males : data.females;
            $scope.worldData.push({
              countryAbbr: _getCountry(country).countriy_ISO_A2,
              countryTitle: country,
              value: value/365/24
            });
          });
        }

        _loadPopulation({
          country: 'World',
          age: ProfileService.getAge()
        }, function(country, data) {
          var value = ProfileService.gender === 'male' ? data.males : data.females;
          $scope.birthdayShare = $sce.trustAsHtml([
            '<span>' + $filter('number')(parseInt(value/365, 0), 0) + '</span> ',
            'people around the world and ',
            '<span>' + $filter('number')(parseInt(value/365/24, 0), 0) + '</span> ',
            'people were born in the same hour'
          ].join(''));
        });

        _updateContinentalCountries();
      };
    })

    .controller('ExpectancyCtrl', function ($scope, $rootScope, $filter, ProfileService, PopulationIOService) {

      var date = $filter('date')(new Date(), 'yyyy-MM-dd');

      $scope.$watch(function () {
        return ProfileService.active;
      }, function (active) {
        if (active) {
          _update();
        }
      });

      $scope.countries = [];

      var _update = function () {
        PopulationIOService.loadCountries(function (countries) {
          $scope.countries = countries;
        });

        $scope.selectedCountryRef = ProfileService.country;
      };

      $scope.$on('timesliderChanged', function (e, year) {
        date = $filter('date')(new Date(year, 1, 1), 'yyyy-MM-dd');
        if ($scope.selectedCountryRef) {
          _updateCountryRef(date);
        }
        if ($scope.selectedCountryRel) {
          _updateCountryRel(date);
        }
      });

      var _updateCountryRef = function (date) {
        PopulationIOService.loadLifeExpectancyRemaining({
          sex: ProfileService.gender,
          country: $scope.selectedCountryRef,
          date: date,
          age: ProfileService.getAge()
        }, function (remainingLife) {
          $scope.highlightCountryRef({
            country: $scope.selectedCountryRef,
            yearsLeft: remainingLife,
            lifeExpectancy: ProfileService.getAge() + remainingLife
          });
        });
      };

      var _updateCountryRel = function (date) {
        PopulationIOService.loadLifeExpectancyRemaining({
          sex: ProfileService.gender,
          country: $scope.selectedCountryRel,
          date: date,
          age: ProfileService.getAge()
        }, function (remainingLife) {
          $scope.highlightCountryRel({
            country: $scope.selectedCountryRel,
            yearsLeft: remainingLife,
            lifeExpectancy: ProfileService.getAge() + remainingLife
          });
        });
      };

      $scope.$watch('selectedCountryRef', function (country) {
        if (country) {
          _updateCountryRef(date);
        }
      });

      $scope.$watch('selectedCountryRel', function (country) {
        if (country) {
          _updateCountryRel(date);
        }
      });

    })
  ;
}());