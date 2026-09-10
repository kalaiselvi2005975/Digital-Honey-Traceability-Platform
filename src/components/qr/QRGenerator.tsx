import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { Button } from '../common/Button';
import { Batch } from '../../models/Batch';
import { formatDate } from '../../utils/dates';
import { qrService } from '../../services/qrService';

interface Props { batch: Batch; }

export function QRGenerator({ batch }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const url = qrService.getBatchUrl(batch.batchId);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${batch.batchId}-qr.svg`;
    link.click();
  };

  const printLabel = () => window.print();

  return (
    <div className="space-y-6">
      {/* Screen view */}
      <div className="no-print flex flex-col items-center gap-6">
        <div ref={qrRef} className="bg-white border-2 border-honey-200 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#92400e"
            level="H"
            includeMargin={true}
          />
          <div className="text-center">
            <p className="font-bold text-warm-900">{batch.batchId}</p>
            <p className="text-xs text-warm-400 break-all max-w-[220px]">{url}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download size={16}/>} onClick={downloadQR}>Download QR</Button>
          <Button variant="secondary" icon={<Printer size={16}/>} onClick={printLabel}>Print Label</Button>
        </div>
      </div>

      {/* Print-only label */}
      <div className="print-only fixed inset-0 flex items-center justify-center bg-white">
        <div style={{ width: 280, border: '2px solid #92400e', borderRadius: 16, padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: '#78350f', marginBottom: 4 }}>PURE HONEY</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>HoneyTrace</p>
          <hr style={{ borderColor: '#fde68a', margin: '8px 0' }} />
          <p style={{ fontSize: 10, color: '#78716c', margin: '4px 0 2px' }}>BATCH</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>{batch.batchId}</p>
          <p style={{ fontSize: 10, color: '#78716c', margin: '4px 0 2px' }}>HARVEST DATE</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#292524', marginBottom: 12 }}>{formatDate(batch.harvestDate)}</p>
          <p style={{ fontSize: 10, color: '#78716c', marginBottom: 8 }}>Scan to Verify Origin</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <QRCodeSVG value={url} size={140} bgColor="#ffffff" fgColor="#92400e" level="H" includeMargin />
          </div>
          <hr style={{ borderColor: '#fde68a', margin: '8px 0' }} />
          <p style={{ fontSize: 10, color: '#78350f', fontWeight: 600 }}>HoneyTrace · Verified Origin</p>
          <p style={{ fontSize: 9, color: '#a8a29e' }}>From Hive to Bottle. Verified.</p>
        </div>
      </div>
    </div>
  );
}
