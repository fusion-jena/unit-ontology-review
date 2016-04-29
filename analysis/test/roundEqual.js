require( '../util/roundEqual' );
var test = require('unit.js'),
    precision  = require( '../util/precision' ),
    roundEqual  = require( '../util/roundEqual' );

// testing precision()
test.assert.strictEqual(precision(Infinity), 0, "Testing precision of Infinity");
test.assert.strictEqual(precision(NaN), 0, "Testing precision of NaN");
test.assert.strictEqual(precision(-Infinity), 0, "Testing precision of -Infinity");
test.assert.strictEqual(precision(-0), 0, "Testing precision of -0");
test.assert.strictEqual(precision(0), 0, "Testing precision of 0");
test.assert.strictEqual(precision(1), 0, "Testing precision of 1");
test.assert.strictEqual(precision(10), -1, "Testing precision of 10");
test.assert.strictEqual(precision(11), 0, "Testing precision of 11");
test.assert.strictEqual(precision(100), -2, "Testing precision of 100");
test.assert.strictEqual(precision(101), 0, "Testing precision of 101");
test.assert.strictEqual(precision(110), -1, "Testing precision of 110");
test.assert.strictEqual(precision(111), 0, "Testing precision of 111");
test.assert.strictEqual(precision(1000), -3, "Testing precision of 1000");
test.assert.strictEqual(precision(0.0), 0, "Testing precision of 0.0");
test.assert.strictEqual(precision(0.1), 1, "Testing precision of 0.1");
test.assert.strictEqual(precision(0.10), 1, "Testing precision of 0.10");
test.assert.strictEqual(precision(0.11), 2, "Testing precision of 0.11");
test.assert.strictEqual(precision(0.100), 1, "Testing precision of 0.100");
test.assert.strictEqual(precision(0.101), 3, "Testing precision of 0.101");
test.assert.strictEqual(precision(0.110), 2, "Testing precision of 0.110");
test.assert.strictEqual(precision(0.111), 3, "Testing precision of 0.111");
test.assert.strictEqual(precision(1.0), 0, "Testing precision of 1.0");
test.assert.strictEqual(precision(1.1), 1, "Testing precision of 1.1");
test.assert.strictEqual(precision(1.10), 1, "Testing precision of 1.10");
test.assert.strictEqual(precision(1.11), 2, "Testing precision of 1.11");
test.assert.strictEqual(precision(1.100), 1, "Testing precision of 1.100");
test.assert.strictEqual(precision(1.101), 3, "Testing precision of 1.101");
test.assert.strictEqual(precision(1.110), 2, "Testing precision of 1.110");
test.assert.strictEqual(precision(1.111), 3, "Testing precision of 1.111");

// testing roundEqual()
test.assert.strictEqual(roundEqual(0, 0), true, "0 and 0 (precisionMin default)");
test.assert.strictEqual(roundEqual(1, 1), true, "1 and 1 (precisionMin default)");
test.assert.strictEqual(roundEqual(-1, -1), true, "-1 and -1 (precisionMin default)");
test.assert.strictEqual(roundEqual(0.001, 0.001), true, "0 and 0 (precisionMin default)");
test.assert.strictEqual(roundEqual(100, 100), true, "100 and 100 (precisionMin default)");
test.assert.strictEqual(roundEqual(100, 1,-2), true, "1 and 100 (precisionMin -2)");
test.assert.strictEqual(roundEqual(0.001, 1), false, "0.001 and 1 (precisionMin default)");
test.assert.strictEqual(roundEqual(5.78, 5.763453), false, "5.78 and 5.763453 (precisionMin default)");
test.assert.strictEqual(roundEqual(5.77, 5.763453), true, "5.77 and 5.763453 (precisionMin default)");
test.assert.strictEqual(roundEqual(5.763453, 5.77), true, "5.763453 and 5.77 (precisionMin default)");
test.assert.strictEqual(roundEqual(5.001, 5.002), true, "5.001 and 5.002 (precisionMin default)");
test.assert.strictEqual(roundEqual(5.001, 5.003), false, "5.001 and 5.003 (precisionMin default)");
test.assert.strictEqual(roundEqual(149597870700, 149597870000), true, "149597870700 and 149597870000 (precisionMin default)");
test.assert.strictEqual(roundEqual(149597870700, 149597870000,2,10), false, "149597870700 and 149597870000 (precisionMin = 2, digitsMin = 10)");