import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Share2, Printer, X } from 'lucide-react';

export interface ReceiptData {
  clientName: string;
  equipment: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  value: number;
  address: string;
  phone: string;
  status: string;
  invoiceLink?: string;
}

interface ReceiptProps {
  data: ReceiptData;
  onClose: () => void;
}

export function ReceiptComponent({ data, onClose }: ReceiptProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`recibo-${data.clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Recibo de Locação',
          text: `Recibo para ${data.clientName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-2xl font-bold text-gray-900">Recibo de Locação</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title="Imprimir"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title="Compartilhar"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={receiptRef} className="receipt-content bg-white p-8 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Beauty Tech</h1>
                <p className="text-gray-600">CNPJ: XX.XXX.XXX/0001-XX</p>
                <p className="text-gray-600">contato@beautytech.com.br</p>
                <p className="text-gray-600">(41) 99999-9999</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Data de Emissão:</p>
                <p className="font-semibold">
                  {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  {data.status}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Detalhes da Locação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Cliente</p>
                  <p className="font-semibold">{data.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Equipamento</p>
                  <p className="font-semibold">{data.equipment}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Data</p>
                  <p className="font-semibold">
                    {format(data.date, "dd/MM/yyyy (EEE)", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Horário</p>
                  <p className="font-semibold">
                    {data.startTime} às {data.endTime} ({data.hours}hrs)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Telefone</p>
                  <p className="font-semibold">{data.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Valor Total</p>
                  <p className="font-semibold text-xl text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(data.value)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Local de Entrega</h2>
              <p className="text-gray-800">{data.address}</p>
            </div>

            {data.invoiceLink && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Link da Nota Fiscal</h2>
                <a
                  href={data.invoiceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline break-all"
                >
                  {data.invoiceLink}
                </a>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-600 italic">
                Após o OK de confirmação, não será possível fazer alterações para reduzir o período de
                locação, por demanda logística. Favor ler atenciosamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}