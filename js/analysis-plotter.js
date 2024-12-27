'use strict';

/**
 * Plot result from the beam analysis calculation into a graph
 */
class AnalysisPlotter {
    constructor(container) {
        this.container = container;
    }

    /**
     * Plot equation.
     *
     * @param {Object{beam : Beam, load : float, equation: Function}}  The equation data
     */
    plot(data) {
        if (data.equation.analys == "shearforce") {
            const shear_force_plot = new Chart("shear_force_plot", {
                type: "line",
                data: {
                    labels: data.equation.xdata,
                    datasets: [{
                        label: "Shear Force",
                        data: data.equation.ydata,
                        borderWidth: 2,
                        borderColor: 'rgb(255, 15, 15)',
                        fill: true
                      }]
                },
                options: {
                    legend: {display: true},
                }
            });
            shear_force_plot.update()
        }else if (data.equation.analys == 'bendingmoment') {
            const bending_moment_plot = new Chart("bending_moment_plot", {
                type: "line",
                data: {
                    labels: data.equation.xdata,
                    datasets: [{
                        label: "Bending Moment",
                        borderWidth:2,
                        fill: true,
                        borderColor: 'rgb(255, 15, 15)',
                        data: data.equation.ydata
                      }]
                },
                options: {
                    legend: {display: true},
                    
                }
            });
            
        }else if (data.equation.analys == 'deflection') {
            const deflection_plot = new Chart("deflection_plot", {
                type: "line",
                data: {
                    labels:data.equation.xdata,
                    datasets: [{
                        label: "Deflection",
                        borderWidth:2,
                        fill: true,
                        borderColor: 'rgb(255, 15, 15)',
                        data: data.equation.ydata
                      }]
                },
                options: {
                    legend: {display: true},
                }
            });
        }
    }
    
}