
import React, { useEffect, useState } from 'react';
import { runAssetDiagnostics } from '../utils/assetUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DiagnosticsProps {
  onClose?: () => void;
}

const Diagnostics: React.FC<DiagnosticsProps> = ({ onClose }) => {
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, boolean> | null>(null);
  const [systemInfo, setSystemInfo] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const gatherInfo = async () => {
      setIsLoading(true);
      
      // Gather system info
      const info: Record<string, string> = {
        'User Agent': navigator.userAgent,
        'Screen Size': `${window.screen.width}x${window.screen.height}`,
        'Window Size': `${window.innerWidth}x${window.innerHeight}`,
        'URL': window.location.href,
        'Pathname': window.location.pathname,
        'Environment': import.meta.env.MODE || 'unknown',
        'Base URL': import.meta.env.BASE_URL || '/',
      };
      
      // Check WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        info['WebGL Supported'] = gl ? 'Yes' : 'No';
        
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            info['WebGL Vendor'] = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            info['WebGL Renderer'] = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch (e) {
        info['WebGL Status'] = `Error checking: ${e instanceof Error ? e.message : String(e)}`;
      }

      setSystemInfo(info);
      
      // Run asset diagnostics
      try {
        const { results } = await runAssetDiagnostics();
        setDiagnosticResults(results);
      } catch (e) {
        console.error('Error running diagnostics:', e);
      }
      
      setIsLoading(false);
    };
    
    gatherInfo();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black bg-opacity-90 text-white border-gray-800">
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
        <CardDescription className="text-gray-400">
          Troubleshooting information to help debug issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-8 h-8 border-t-2 border-purple-600 rounded-full animate-spin"></div>
            <span className="ml-2">Loading diagnostics...</span>
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-lg font-medium mb-2">System Information</h3>
              <div className="bg-gray-900 rounded-md p-3 text-xs font-mono">
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                    <span className="text-gray-400">{key}:</span>
                    <span className="col-span-2 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">Asset Check</h3>
              {diagnosticResults ? (
                <div className="bg-gray-900 rounded-md p-3">
                  <ul>
                    {Object.entries(diagnosticResults).map(([key, success]) => (
                      <li key={key} className={`flex items-center ${success ? "text-green-400" : "text-red-400"} mb-1`}>
                        <span className="mr-2">{success ? "✓" : "✗"}</span>
                        <span>{key}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-yellow-400">Failed to run asset diagnostics</p>
              )}
            </section>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            // Copy diagnostics to clipboard
            const text = `DIAGNOSTICS REPORT\n\nSystem Info:\n${
              Object.entries(systemInfo).map(([k, v]) => `${k}: ${v}`).join('\n')
            }\n\nAsset Check:\n${
              diagnosticResults ? 
                Object.entries(diagnosticResults).map(([k, v]) => `${k}: ${v ? 'Success' : 'Failed'}`).join('\n') : 
                'Could not run asset check'
            }`;
            
            navigator.clipboard.writeText(text)
              .then(() => alert('Diagnostics copied to clipboard'))
              .catch(err => console.error('Failed to copy:', err));
          }}
        >
          Copy Report
        </Button>
        
        {onClose && (
          <Button onClick={onClose}>Close</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Diagnostics;
