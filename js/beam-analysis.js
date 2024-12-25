'use strict';

/** ============================ Beam Analysis Data Type ============================ */

/**
 * Beam material specification.
 *
 * @param {String} name         Material name
 * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
 */
class Material {
    constructor(name, properties) {
        this.name = name;
        this.properties = properties;
    }
}

/**
 *
 * @param {Number} primarySpan          Beam primary span length
 * @param {Number} secondarySpan        Beam secondary span length
 * @param {Material} material           Beam material object
 */
class Beam {
    constructor(primarySpan, secondarySpan, material) {
        this.primarySpan = primarySpan;
        this.secondarySpan = secondarySpan;
        this.material = material;
    }
}

/** ============================ Beam Analysis Class ============================ */

class BeamAnalysis {
    constructor() {
        this.options = {
            condition: 'simply-supported'
        };

        this.analyzer = {
            'simply-supported': new BeamAnalysis.analyzer.simplySupported(),
            'two-span-unequal': new BeamAnalysis.analyzer.twoSpanUnequal()
        };
    }
    /**
     *
     * @param {Beam} beam
     * @param {Number} load
     */
    getDeflection(beam, load, condition) {
        var analyzer = this.analyzer[condition];
        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getDeflectionEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getBendingMoment(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getBendingMomentEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getShearForce(beam, load, condition) {
        var analyzer = this.analyzer[condition];
      
        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getShearForceEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
}




/** ============================ Beam Analysis Analyzer ============================ */

/**
 * Available analyzers for different conditions
 */
BeamAnalysis.analyzer = {};

/**
 * Calculate deflection, bending stress and shear stress for a simply supported beam
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.simplySupported = class {
    constructor(beam, load) {
        this.beam = beam;
        this.load = load;
    }
    getDeflectionEquation(beam, load) {
        const array = []
        var j = beam.j2
        var w =load;
        var l = beam.primarySpan;
        var Ei = beam.material.properties.EI
        for (let x = 0; x <= beam.primarySpan; x+=beam.primarySpan/10) {
            var v = -((w*x)/(24*Ei/Math.pow(1000, 3)))*(Math.pow(l, 3)-2*l*Math.pow(x,2)+Math.pow(x, 3))*j*1000
            array.unshift({"x" : x, "y" : v})
        }
        
        return {"analys" : "deflection", data : array}
    }
    getBendingMomentEquation(beam, load) {
        const array = []
        var w =load;
        var l = beam.primarySpan;
        var Ei = beam.material.properties.EI
        for (let x = 0; x <= beam.primarySpan; x+=beam.primarySpan/10) {
            var v =  ((w*x/2)*(beam.primarySpan-x)*(-1))
            array.unshift({"x" : x, "y" : v})
        }
        return {"analys" : "bendingmoment", data : array}
    }
    getShearForceEquation(beam, load) {
        const array = []
        var w =load;
        var l = beam.primarySpan;
        var Ei = beam.material.properties.EI
        for (let x = 0; x <= beam.primarySpan; x+=beam.primarySpan/10) {
            var v =  w*(beam.primarySpan/2-x)
            array.unshift({"x" : x, "y" : v})
        }
        return {"analys" : "shearforce", data : array}
    }
};


/**
 * Calculate deflection, bending stress and shear stress for a beam with two spans of equal condition
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.twoSpanUnequal = class {
    constructor(beam, load) {
        this.beam = beam;
        this.load = load;
    }
    getDeflectionEquation(beam, load) {
        var j = beam.j2
        var w =load
        var l1 = beam.primarySpan
        var l2 = beam.secondarySpan
        var Ei = beam.material.properties.EI
        var l = l1+l2
        var m1 = -((w*Math.pow(l2, 3))+(w*Math.pow(l1, 3)))/(8*(l1+l2))
        var r1 = (m1/l1)+((w*l1)/2)
        var r3 = (m1/l2)+((w*l2)/2)
        var r2 = (w*l1)+(w*l2)-r1-r3
        var m = 0;
        var lk = 0;
        function calculateValue(x, l, l1, r1, w, mn, r3) {
            if (x === 0) {
                m = x + l / 10;
                lk = (x + l / 10) - (m + l / 10);
                return x + l / 10;
            }
            else if (Math.abs(x - l1) <= l / 10 && x - l1 < 0) {
                lk = x
                return l1;
            }
            else if (x < l1 && x !== r1 / w && mn !== r1 / w && Math.abs(x - r1 / w) <= l / 10) {
                lk = x
                return r1 / w;
            }
            else if (Math.abs(x - l) < l / 10) {
                return l;
            }
            else if ( x > l1 && x !== l - r3 / w && mn !== l - r3 / w && Math.abs(x - (l - r3 / w)) < l / 10) {
                lk = x
                return l - r3 / w;
            }
            else if (x === r1 / w || x === l - r3 / w) {
                lk = x
                return mn + l / 10;
            }
            else {
                lk = (x + l / 10) - (m + l / 10);
                m = x + l / 10;
                return x + l / 10;
            }
        }
        function calculatePoint1(x, Ei, r1, w, l1, j) {
            return (
                (x / (24 * Ei/Math.pow(1000, 3))) *
                (
                    (4 * r1 * Math.pow(x, 2)) -
                    (w * Math.pow(x, 3)) +
                    (w * Math.pow(l1, 3)) -
                    (4 * r1 * Math.pow(l1, 2))
                )
            ) * 1000 * j;
        }
        function calculatePoint2(x, r1, r2, l1, w, Ei, j) {
            const term1 = (r1 * x / 6) * (Math.pow(x, 2) - Math.pow(l1, 2));
            const term2 = (r2 * x / 6) * (Math.pow(x, 2) - 3 * l1 * x + 3 * Math.pow(l1, 2));
            const term3 = (r2 * Math.pow(l1, 3)) / 6;
            const term4 = (w * x / 24) * (Math.pow(x, 3) - Math.pow(l1, 3));
            const denominator = Ei/Math.pow(1000, 3);
        
            return (((term1 + term2 - term3 - term4) / denominator) * 1000 * j);
        }
        var array = []
        let i = 0
        for(m = 0; m <= l; m = calculateValue(m, l, l1, r1, w, lk, r3), i++){
            if (i <= 11) {
                var y = calculatePoint1(m, Ei, r1, w, l1, j)
            }else{
                var y = calculatePoint2(m,r1,r2,l1,w,Ei,j)
            }
            
            var x = m
            array.unshift({"x" : x, "y" : y})
            if (m == l) {
                break
            }
        }
        const reversearray = array.reverse()
        return {"analys" : "deflection", data : reversearray}
    }
    getBendingMomentEquation(beam, load) {
        var w =load
        var l1 = beam.primarySpan
        var l2 = beam.secondarySpan
        var l = l1+l2
        var m1 = -((w*Math.pow(l2, 3))+(w*Math.pow(l1, 3)))/(8*(l1+l2))
        var r1 = (m1/l1)+((w*l1)/2)
        var r3 = (m1/l2)+((w*l2)/2)
        var r2 = (w*l1)+(w*l2)-r1-r3
        var m = 0;
        var lk = 0;
        function calculateValue(x, l, l1, r1, w, mn, r3) {
            if (x === 0) {
                m = x + l / 10;
                lk = (x + l / 10) - (m + l / 10);
                return x + l / 10;
            }
            else if (Math.abs(x - l1) <= l / 10 && x - l1 < 0) {
                lk = x
                return l1;
            }
            else if (x < l1 && x !== r1 / w && mn !== r1 / w && Math.abs(x - r1 / w) <= l / 10) {
                lk = x
                return r1 / w;
            }
            else if (Math.abs(x - l) < l / 10) {
                return l;
            }
            else if ( x > l1 && x !== l - r3 / w && mn !== l - r3 / w && Math.abs(x - (l - r3 / w)) < l / 10) {
                lk = x
                return l - r3 / w;
            }
            else if (x === r1 / w || x === l - r3 / w) {
                lk = x
                return mn + l / 10;
            }
            else {
                lk = (x + l / 10) - (m + l / 10);
                m = x + l / 10;
                return x + l / 10;
            }
        }
        function calculateRoundedValue(x, l, l1, r1, w, r2) {
            if (x === 0 || x === l) {
                return 0;
            } 
            else if (x < l1) {
                return -(
                    r1 * x - 
                    0.5 * w * Math.pow(x, 2)
                ).toFixed(2);
            } 
            else if (x > l1) {
                return -(
                    (r1 * x + r2 * (x - l1)) - 
                    0.5 * w * Math.pow(x, 2)
                ).toFixed(2);
            } 
            else {
                return -(
                    r1 * l1 - 
                    0.5 * w * Math.pow(l1, 2)
                ).toFixed(2);
            }
        }
        var array = []
        for(m = 0; m <= l; m = calculateValue(m, l, l1, r1, w, lk, r3)){
            var y = calculateRoundedValue(m,l,l1,r1,w,r2)
            var x = m
            array.unshift({"x" : x, "y" : y})
            if (m == l) {
                break
            }
        }
        const reversearray = array.reverse()
        return {"analys" : "bendingmoment", data : reversearray}
    }
    getShearForceEquation(beam, load) {
        var w =load
        var l1 = beam.primarySpan
        var l2 = beam.secondarySpan
        var l = l1+l2
        var m1 = -((w*Math.pow(l2, 3))+(w*Math.pow(l1, 3)))/(8*(l1+l2))
        var r1 = (m1/l1)+((w*l1)/2)
        var r3 = (m1/l2)+((w*l2)/2)
        var r2 = (w*l1)+(w*l2)-r1-r3
        var m = 0;
        var mn = 0;
        function calculateValue(x, m, l1, l) {
            if (x == 0) {
                m = x + l / 10;
                mn = (x + l / 10) - (m + l / 10);
                return x + l / 10;
            } else if (Math.abs(x - l1) <= l / 10 && x - l1 < 0) {
                mn = x
                return l1;
            } else if (x - l1 == 0 && Math.abs(m - l1) <= l / 10 && m !== x) {
                mn = x
                return l1;
            } else if (Math.abs(x - l) < l / 10) {
                return l;
            }else{
                mn = (x + l / 10) - (m + l / 10);
                m = x + l / 10;
                return x + l / 10;
            }
        }
        function calculate(x, m, mn, r1, r2, w, l, l1) {
            if (x === 0) {
                return r1;
            } else if (x === l) {
                return (r1 + r2) - (w * l);
            } else if (x === l1 && (m - l1) < 0) {
                return r1 - (w * l1);
            } else if (x === l1 && (mn - l1) > 0) {
                return (r1 + r2) - (w * l1);
            } else if (x < l1) {
                return r1 - (w * x);
            } else {
                return (r1 + r2) - (w * x);
            }
        }

        var array = []
        
        for(m = 0; m <= l; m = calculateValue(m, mn, l1, l)) {
            var y =  calculate(m, mn, m,  r1, r2, w, l, l1)
            var x = m
            array.unshift({"x" : x, "y" : y})
            if (m == l) {
                break
            }
            
        }
        const reversearray = array.reverse()
        return {"analys" : "shearforce", data :reversearray}
    }
};
