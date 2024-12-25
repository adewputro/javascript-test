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
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(0,0,255,1)",
                        data: data.equation.data
                      }]
                },
                options: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: "shear_force",
                        fontSize: 16
                    }
                }
            });
            shear_force_plot.update()
        }else if (data.equation.analys == 'bendingmoment') {
            const bending_moment_plot = new Chart("bending_moment_plot", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(0,0,255,1)",
                        data: data.equation.data
                      }]
                },
                options: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: "bending_moment",
                        fontSize: 16
                    }
                }
            });
            
        }else if (data.equation.analys == 'deflection') {
            const deflection_plot = new Chart("deflection_plot", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(0,0,255,1)",
                        data: data.equation.data
                      }]
                },
                options: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: "deflection",
                        fontSize: 16
                    }
                }
            });
        }
    }
    
}