import React from "react";
import ReactApexChart from "react-apexcharts";

export default class ApexChart extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.state = {
      series: this.props.diff,
      options: {
        chart: {
          height: 100,
          type: "rangeBar"
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "80%"
          }
        },
        xaxis: {
          type: "datetime"
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [50, 0, 100, 100]
          }
        },
        legend: {
          position: "top",
          horizontalAlign: "left"
        },
        tooltip: {
          enabled: true,
          custom: function({ series, seriesIndex, dataPointIndex, w }) {
            // console.log("seriesIndex ", seriesIndex);
            // console.log("dataPointIndex ", dataPointIndex);
            console.log("series ", series);
            console.log(
              "series ",
              w.config.series[seriesIndex].data[dataPointIndex].y
            );

            return (
              '<div class="arrow_box">' +
              "<span>" +
              w.config.series[seriesIndex].data[dataPointIndex].y[0] +
              "-" +
              w.config.series[seriesIndex].data[dataPointIndex].y[1] +
              "</span>" +
              "</div>"
            );
          }
        }
      }
    };
  }

  render() {
    return (
      <div>
        <div id="chart">
          <ReactApexChart
            options={this.state.options}
            series={this.state.series}
            type="rangeBar"
            height={250}
          />
        </div>
        {/* <div id="html-dist"></div> */}
      </div>
    );
  }
}
