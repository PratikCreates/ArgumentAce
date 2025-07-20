"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const TestComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Test Component</h2>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
};

export default TestComponent;