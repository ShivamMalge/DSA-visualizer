import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button, Input } from './ui/Button';  
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';


const Visualizer = () => {
  const [representation, setRepresentation] = useState('array');
  const [coefficients, setCoefficients] = useState([]);
  const [degree, setDegree] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [graphData, setGraphData] = useState([]);
  const [evaluationPoint, setEvaluationPoint] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const createPolynomial = () => {
    const deg = parseInt(degree);
    if (isNaN(deg) || deg < 0) {
      setResult('Please enter a valid degree (0 or greater)');
      return;
    }
    
    const newCoeffs = new Array(deg + 1).fill(0);
    setCoefficients(newCoeffs);
    updateGraphData(newCoeffs);
  };

  const updateCoefficient = (index, value) => {
    const newCoeffs = [...coefficients];
    newCoeffs[index] = parseFloat(value) || 0;
    setCoefficients(newCoeffs);
    updateGraphData(newCoeffs);
  };

  const getGraphRange = (coeffs, evalPoint) => {
    if (!evalPoint) {
      
      return { start: -10, end: 10, step: 0.5 };
    }

    const x = evalPoint.x;
    
    const magnitude = Math.abs(x);
    const range = magnitude === 0 ? 10 : magnitude * 2;
    
    return {
      start: x - range,
      end: x + range,
      step: range / 100 
    };
  };

  const updateGraphData = (coeffs) => {
    const { start, end, step } = getGraphRange(coeffs, evaluationPoint);
    const data = [];
    
    for (let x = start; x <= end; x += step) {
      const y = evaluateAtX(coeffs, x);
      if (isFinite(y)) {
        data.push({ x, y });
      }
    }
    setGraphData(data);
  };

  const evaluateAtX = (coeffs, x) => {
    return coeffs.reduce((sum, coef, power) => sum + coef * Math.pow(x, power), 0);
  };

  const evaluatePolynomial = () => {
    const x = parseFloat(value);
    if (isNaN(x)) {
      setResult('Please enter a valid number');
      return;
    }
    
    const y = evaluateAtX(coefficients, x);
    if (!isFinite(y)) {
        setResult(`P(${x}) = Value too large to display`);
}       else {
        setResult(`P(${x}) = ${y}`);
}
    setEvaluationPoint({ x, y });
    updateGraphData(coefficients);
  };

  const renderArrayView = () => (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex flex-wrap gap-2 min-w-min">
        {coefficients.map((coef, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-xs text-gray-500">index {i}</div>
            <div className="w-16 h-16 border-2 border-blue-500 rounded flex items-center justify-center bg-white">
              {coef}
            </div>
            <div className="text-xs text-gray-500">x^{i}</div>
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600">
        Memory layout: Sequential storage of coefficients
      </div>
    </div>
  );

  const renderLinkedListView = () => (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex flex-nowrap items-center min-w-min">
        {coefficients.map((coef, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500">node {i}</div>
              <div className="w-32 h-16 border-2 border-green-500 rounded bg-white">
                <div className="h-full flex items-center">
                  <div className="w-1/2 border-r-2 border-gray-200 flex items-center justify-center">
                    {coef}
                  </div>
                  <div className="w-1/2 flex items-center justify-center text-xs">
                    pow: {i}
                  </div>
                </div>
              </div>
            </div>
            {i < coefficients.length - 1 && (
              <ArrowRight className="mx-2 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
        <div className="flex items-center">
          <ArrowRight className="mx-2 text-gray-400 flex-shrink-0" />
          <div className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center">
            null
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        Memory layout: Nodes connected by pointers
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Polynomial Data Structure Debug Visualizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
      
        <div className="space-y-2">
          <div className="text-lg font-medium">1. Select Data Structure</div>
          <div className="flex gap-2">
            <Button 
              variant={representation === 'array' ? 'default' : 'outline'}
              onClick={() => setRepresentation('array')}
            >
              Array
            </Button>
            <Button
              variant={representation === 'linkedlist' ? 'default' : 'outline'}
              onClick={() => setRepresentation('linkedlist')}
            >
              Linked List
            </Button>
          </div>
        </div>

      
        <div className="space-y-2">
          <div className="text-lg font-medium">2. Initialize Polynomial</div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Enter degree"
              className="w-32"
            />
            <Button onClick={createPolynomial}>Create</Button>
          </div>
        </div>

    
        {coefficients.length > 0 && (
          <div className="space-y-2">
            <div className="text-lg font-medium">3. Memory Visualization</div>
            <div className="bg-gray-50 p-4 rounded border">
              {representation === 'array' ? renderArrayView() : renderLinkedListView()}
            </div>
          </div>
        )}

      
        {coefficients.length > 0 && (
          <div className="space-y-2">
            <div className="text-lg font-medium">4. Set Coefficients</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {coefficients.map((coef, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm">x^{index}:</span>
                  <Input
                    type="number"
                    value={coef}
                    onChange={(e) => updateCoefficient(index, e.target.value)}
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        
        {graphData.length > 0 && (
          <div className="space-y-2">
            <div className="text-lg font-medium">5. Polynomial Graph</div>
            <div className="bg-white p-4 rounded border" ref={chartContainerRef}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={graphData} 
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x"
                    type="number"
                    allowDataOverflow={true}
                    domain={['auto', 'auto']}
                  />
                  <YAxis 
                    type="number"
                    allowDataOverflow={true}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke="#8884d8" 
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  {evaluationPoint && isFinite(evaluationPoint.y) && (
                    <ReferenceDot
                      x={evaluationPoint.x}
                      y={evaluationPoint.y}
                      r={5}
                      fill="red"
                      stroke="none"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

 
        {coefficients.length > 0 && (
          <div className="space-y-2">
            <div className="text-lg font-medium">6. Evaluate Polynomial</div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter x value"
                className="w-32"
              />
              <Button onClick={evaluatePolynomial}>Evaluate</Button>
            </div>
          </div>
        )}

     
        {result && (
          <div className="bg-blue-50 p-4 rounded">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Visualizer;