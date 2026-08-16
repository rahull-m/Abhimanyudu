import React, { useState } from 'react';
import type { Transaction, RecipientProfile } from '../types/payment';
import { INITIAL_USER_ACCOUNTS, RECIPIENT_CATALOG } from '../services/mockData';
import { X, Send, Cpu } from 'lucide-react';

interface CustomTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Partial<Transaction>) => void;
}

export const CustomTxModal: React.FC<CustomTxModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [selectedUser, setSelectedUser] = useState(INITIAL_USER_ACCOUNTS[0]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientProfile>(RECIPIENT_CATALOG[0]);
  const [amount, setAmount] = useState<number>(25000);
  const [city, setCity] = useState<string>('Mumbai');
  const [ip, setIp] = useState<string>('103.44.12.98');
  const [deviceName, setDeviceName] = useState<string>('iPhone 15 Pro');
  const [isEmulator, setIsEmulator] = useState<boolean>(false);
  const [isVpn, setIsVpn] = useState<boolean>(false);
  const [isKnownDevice, setIsKnownDevice] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Partial<Transaction> = {
      id: `TX_CUSTOM_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      senderId: selectedUser.id,
      senderName: selectedUser.name,
      senderVpa: selectedUser.vpa,
      senderAvgTxAmount: selectedUser.avgAmount,
      amount: Number(amount),
      currency: 'INR',
      recipient: selectedRecipient,
      location: { city, country: 'India', lat: selectedUser.lat, lng: selectedUser.lng, ip },
      previousLocation: { city: selectedUser.city, country: 'India', lat: selectedUser.lat, lng: selectedUser.lng, ip: selectedUser.ip },
      previousTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      device: { deviceId: `dev_cust_${Date.now()}`, deviceName, os: 'iOS / Android', isEmulator, isVpn, isKnownDevice }
    };

    onSubmit(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-base font-bold text-white">Inject Custom Test Payment Payload</h3>
              <p className="text-xs text-slate-400">Craft custom transaction variables to test AI scoring</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Sender */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Sender Account Profile</label>
            <select
              value={selectedUser.id}
              onChange={(e) => {
                const u = INITIAL_USER_ACCOUNTS.find(usr => usr.id === e.target.value);
                if (u) setSelectedUser(u);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500"
            >
              {INITIAL_USER_ACCOUNTS.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.vpa}) — Avg: ₹{u.avgAmount}
                </option>
              ))}
            </select>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Recipient VPA</label>
            <select
              value={selectedRecipient.vpa}
              onChange={(e) => {
                const r = RECIPIENT_CATALOG.find(rec => rec.vpa === e.target.value);
                if (r) setSelectedRecipient(r);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500"
            >
              {RECIPIENT_CATALOG.map(r => (
                <option key={r.vpa} value={r.vpa}>
                  {r.name} ({r.vpa}) {r.isKnownMule ? '🚨 [KNOWN MULE]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Transaction Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold focus:border-cyan-500"
              placeholder="e.g. 50000"
            />
          </div>

          {/* City & IP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device IP Address</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Device Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Device Hardware Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <label className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Is Emulator</span>
              <input
                type="checkbox"
                checked={isEmulator}
                onChange={(e) => setIsEmulator(e.target.checked)}
                className="accent-cyan-500"
              />
            </label>

            <label className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Is VPN/Proxy</span>
              <input
                type="checkbox"
                checked={isVpn}
                onChange={(e) => setIsVpn(e.target.checked)}
                className="accent-cyan-500"
              />
            </label>

            <label className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Known Device</span>
              <input
                type="checkbox"
                checked={isKnownDevice}
                onChange={(e) => setIsKnownDevice(e.target.checked)}
                className="accent-cyan-500"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-900/30"
            >
              <Send className="w-4 h-4" />
              <span>Evaluate Risk</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
