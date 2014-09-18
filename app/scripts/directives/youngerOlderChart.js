(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('youngerOlderChart', function ($filter, PopulationIOService, HelloWords) {
      return {
        restrict: 'E',
        link: function ($scope, element) {
          var xRange, yRange, xAxis, yAxis, line, area,
            parentWidth = element[0].clientWidth,
            parentHeight = 200;

          var chart = d3.select(element[0])
              .append('svg')
              .attr({width: parentWidth, height: parentHeight + 40})
              .append('g')
              .attr({
                class: 'younger-older-chart',
                transform: 'translate(0,20)'
              })
            ;

          var data = [
            {age: 10, population: 20000000},
            {age: 12, population: 19000000},
            {age: 13, population: 18030000},
            {age: 14, population: 16001000},
            {age: 15, population: 14000000},
            {age: 18, population: 13500000},
            {age: 20, population: 13300000},
            {age: 24, population: 12700000},
            {age: 27, population: 12400000},
            {age: 28, population: 12000000},
            {age: 32, population: 14000000},
            {age: 33, population: 11500000},
            {age: 35, population: 11600000},
            {age: 36, population: 11200000},
            {age: 39, population: 11000000},
            {age: 40, population: 10500000},
            {age: 41, population: 10500000},
            {age: 43, population: 10400000},
            {age: 44, population: 10600000},
            {age: 45, population: 10700000},
            {age: 46, population: 8600000},
            {age: 47, population: 8700000},
            {age: 50, population: 8400000},
            {age: 55, population: 8000000},
            {age: 70, population: 5600000},
            {age: 80, population: 4800000},
            {age: 85, population: 4200000},
            {age: 90, population: 4000000},
            {age: 95, population: 4100000},
            {age: 100, population: 4000000},
            {age: 105, population: 300000},
            {age: 110, population: 20000},
            {age: 115, population: 15000},
            {age: 125, population: 7000},
            {age: 127, population: 3000},
            {age: 130, population: 1000}
          ];
          var yAxisFormat = d3.format('s')
          xRange = d3.scale.linear().range([0, parentWidth]).domain([0, d3.max(data, function (d) {
            return d.age;
          })]);
          yRange = d3.scale.linear().range([parentHeight, 0]).domain([0, d3.max(data, function (d) {
            return d.population;
          })]);


          xAxis = d3.svg.axis()
            .scale(xRange)
            .tickSize(5)
            .tickSubdivide(true)
            .tickFormat(function (d) {return d + 'y'})
          yAxis = d3.svg.axis()
            .scale(yRange)
            .tickSize(5)
            .orient('left')
            .tickSubdivide(true)
            .tickFormat(function (d) {return yAxisFormat(d).replace('M', ' M')})
          ;

          line = d3.svg.line()
            .x(function (d) {
              return xRange(d.age);
            })
            .y(function (d) {
              return yRange(d.population);
            })
            .interpolate('linear');

          area = d3.svg.area()
            .x(function (d) { return xRange(d.age); })
            .y0(parentHeight)
            .y1(function (d) { return yRange(d.population); });

          var younger = data.slice(0, 20);

          chart.append('path')
            .attr('d', area(data))
            .attr('fill', '#f7f7f7')

          chart.append('path')
            .attr('d', area(younger))
            .attr('fill', '#bde88a')

          chart.append('path')
            .attr('d', line(data))
            .attr('stroke', '#555')
            .attr('stroke-width', 3)
            .attr('fill', 'none');
          chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(100,' + (parentHeight) + ')')
            .call(xAxis);

          chart.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(100,0)')
            .call(yAxis);

          function migratedFromPeopleDirective() {
            function initBarChart(selection) {
              var barHeight = 17;

              var barChart = selection.append('g')
                .attr('class', 'bar-chart');

              var worldBar = barChart.append('g')
                .attr('class', 'bar world');

              worldBar.append('rect')
                .attr({
                  height: barHeight,
                  width: parentWidth
                });
              worldBar.append('rect')
                .attr({
                  'class': 'highlight',
                  height: barHeight,
                  width: 0
                });
              worldBar.append('text')
                .text('0%')
                .attr({
                  'class': 'percent',
                  x: 0
                });
              worldBar.append('g')
                .attr('class', 'x-axis');

              var localBar = barChart.append('g')
                .attr('class', 'bar local');

              localBar.append('rect')
                .attr({
                  height: barHeight,
                  width: parentWidth
                });
              localBar.append('rect')
                .attr({
                  class: 'highlight',
                  height: barHeight,
                  width: 0
                });
              localBar.append('text')
                .text('0%')
                .attr({
                  'class': 'percent',
                  x: 0
                });
              localBar.append('g')
                .attr('class', 'x-axis');
            }

            canvas.updateLocalBar = function (rank, rankTotal) {
              var bar = svg.select('.bar.local'),
                width = parseInt((rank / rankTotal) * parentWidth, 0),
                ticks = 5;

              bar.select('rect.highlight')
                .transition()
                .duration(1000)
                .attr({
                  width: width
                });
              bar.select('text')
                .text(parseInt(100 * rank / rankTotal, 0) + '%')
                .transition()
                .duration(1000)
                .attr({
                  x: width
                });

              var xScale = d3.scale.linear()
                .domain([0, rankTotal])
                .range([0, parentWidth]);

              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(ticks)
                .tickFormat(function (d) { return formatBillions(d).replace('G', 'b');});
              ;

              bar.select('.x-axis')
                .call(xAxis)
                .selectAll('.tick')
                .attr({
                  'class': function (d, i) {
                    var className = 'tick';
                    if (i === 0) {
                      className += ' first';
                    }
                    if (i === ticks - 1) {
                      className += ' last';
                    }
                    return className;
                  }
                });
            }

            canvas.updateGlobalBar = function (rank, rankTotal) {
              var bar = svg.select('.bar.world'),
                width = (rank / rankTotal) * parentWidth,
                ticks = 5;

              bar.select('rect.highlight')
                .transition()
                .duration(1000)
                .attr({
                  width: width
                });
              bar.select('.percent')
                .text(parseInt(100 * rank / rankTotal, 0) + '%')
                .transition()
                .duration(1000)
                .attr({
                  x: width
                });

              var xScale = d3.scale.linear()
                .domain([0, rankTotal])
                .range([0, parentWidth]);

              var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('top')
                .ticks(ticks)
                .tickFormat(function (d) { return formatBillions(d).replace('G', 'B');});

              bar.select('.x-axis')
                .call(xAxis)
                .selectAll('.tick')
                .attr({
                  'class': function (d, i) {
                    var className = 'tick';
                    if (i === 0) {
                      className += ' first';
                    }
                    if (i === ticks - 1) {
                      className += ' last';
                    }
                    return className;
                  }
                });
            }
          }
        }
      };
    });

}());