(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('rankGraph', function (ProfileService) {
      return {
        restrict: 'E',
        scope: {
          data: '=',
          country: '=',
          age: '='
        },
        link: function ($scope, element, attr) {
          var width = 300,
            height = 150;

          var root = d3.select(element[0])
            .append('svg')
            .attr({
              width: width,
              height: height
            })
            .append('g')
            .attr({
              transform: 'translate(' + [ 10, -10 ] + ')'
            });

          $scope.$watch('data', function(data) {
            if (data) {
              _updateGraph(data);
            }
          });

          var _initGraph = function() {
            var frame = root.append('g')
              .attr({
                'class': 'frame'
              });

            frame.append('line')
              .attr({
                'class': 'coord',
                x1: 0,
                x2: width - 50,
                y1: height,
                y2: height
              });
            frame.append('line')
              .attr({
                'class': 'coord',
                x1: 0,
                x2: 0,
                y1: 70,
                y2: height
              });
            frame.append('text')
              .text('People')
              .attr({
                'class': 'people',
                transform: function () {
                  return 'translate(' + [ 3, 50 ] + ') rotate(-90)';
                }
              });
            frame.append('text')
              .text('Age')
              .attr({
                'class': 'age',
                transform: function () {
                  return 'translate(' + [ width - 10, height + 3 ] + ')';
                }
              });

            root.append('g').attr('class', 'chart');
            root.append('g').attr('class', 'pointer');
          };

          var _updateGraph = function(data) {
            var age = $scope.age;

            var peopleTotal = d3.sum(data, function (d) { return d.total; });

            var xScale = d3.scale.linear()
              .domain([
                d3.min(data, function (d) { return d.age; }),
                d3.max(data, function (d) { return d.age; })
              ])
              .range([0, width - 90]);

            var yScale = d3.scale.linear()
              .domain([
                0, d3.max(data, function (d) { return d.total; })
              ])
              .range([height, 90]);

            var area = d3.svg.area()
              .x(function (d) { return xScale(d.age); })
              .y0(function () { return height; })
              .y1(function (d) { return yScale(d.total); })
              .interpolate('basis');

            var areaNull = d3.svg.area()
              .x(function (d) { return xScale(d.age); })
              .y0(function () { return height; })
              .y1(function () { return height; })
              .interpolate('basis');

            var chart = root.select('.chart');

            var path = chart.selectAll('path')
              .data([data]);

            path.transition()
              .duration(1000)
              .attr('d', function() {
                return area(data);
              });

            path.enter()
              .append('path')
              .attr('d', function() {
                return areaNull(data);
              })
              .transition()
              .duration(1000)
              .attr('d', function() {
                return area(data);
              });

            var bisect = d3.bisector(function(d) { return d.age; }).right;
            var item = data[bisect(data, age)];

            if (item) {
              var pointer = root.select('.pointer');

              var group = pointer.selectAll('.pointer-wrapper')
                .data([item])
                .enter()
                .append('g')
                .attr('class', 'pointer-wrapper');

              // TODO: refactore me in a good d3 way
              if (pointer.select('.percentage').empty()) {
                pointer.attr({
                  transform: function () {
                    return 'translate(' + [
                      xScale(age),
                      height
                    ] + ')';
                  }
                });
              }

              pointer.transition().duration(1000)
                .attr({
                  transform: function () {
                    return 'translate(' + [
                      xScale(age),
                        height - (height - yScale(item.total))
                    ] + ')';
                  }
                });

              group.append('line');

              pointer.select('line').transition().duration(1000)
                .attr({
                  x1: 0,
                  y1: 0,
                  x2: width - xScale(age),
                  y2: 0
                });

              group.append('circle')
                .attr({
                  r: 3
                });

              var textBlock = group.append('g');

              textBlock.attr('class', 'text-block');

              textBlock.append('text')
                .attr({
                  'class': 'percentage',
                  transform: function () {
                    return 'translate(' + [0, -30] + ')';
                  }
                });
              textBlock.append('text')
                .text('your age')
                .attr({
                  'class': 'desc',
                  transform: function () {
                    return 'translate(' + [0, -15] + ')';
                  }
                });

              pointer.select('.text-block').transition().duration(1000).attr({
                transform: function () {
                  return 'translate(' + [width - xScale(age) - 10, 0] + ')';
                }
              });
              pointer.select('.percentage')
                .text(function() {
                  var ageTxt = ProfileService.getAgeString();
                  ageTxt = ageTxt.replace('y', 'y ');
                  return ageTxt;
                });
            }
          };

          _initGraph();
        }
      };
    });

}());