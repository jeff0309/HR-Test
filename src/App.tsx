/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Trophy, 
  LayoutGrid, 
  Upload, 
  Trash2, 
  Plus, 
  Play, 
  RotateCcw, 
  Settings2,
  CheckCircle2,
  Download,
  Copy,
  UserPlus,
  FileDown,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { Person, Group, AppTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('list');
  const [people, setPeople] = useState<Person[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Lucky Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [drawnIds, setDrawnIds] = useState<Set<string>>(new Set());
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  
  // Auto Grouping State
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<Person[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const mockNames = [
    '陳小明', '林美玲', '張大華', '李淑芬', '王志強', 
    '吳佩珊', '劉建宏', '蔡雅婷', '黃俊傑', '楊佳玲',
    '趙子龍', '孫悟空', '周杰倫', '蔡依林', '林俊傑',
    '陳奕迅', '張學友', '劉德華', '郭富城', '黎明'
  ];

  const loadMockData = () => {
    const newPeople: Person[] = mockNames.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    setPeople(prev => [...prev, ...newPeople]);
  };

  const duplicateNames = new Set(
    people
      .map(p => p.name)
      .filter((name, index, self) => self.indexOf(name) !== index)
  );

  const removeDuplicates = () => {
    const seen = new Set();
    const uniquePeople = people.filter(person => {
      if (seen.has(person.name)) {
        return false;
      }
      seen.add(person.name);
      return true;
    });
    setPeople(uniquePeople);
  };

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const newPeople: Person[] = results.data
          .flat()
          .filter((name: any) => typeof name === 'string' && name.trim() !== '')
          .map((name: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: name.trim()
          }));
        
        setPeople(prev => [...prev, ...newPeople]);
      },
      header: false
    });
  };

  // Handle Manual Input
  const handleAddFromText = () => {
    const names = inputText.split(/[\n,]+/).filter(n => n.trim() !== '');
    const newPeople: Person[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim()
    }));
    setPeople(prev => [...prev, ...newPeople]);
    setInputText('');
  };

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    setDrawnIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const clearAll = () => {
    setPeople([]);
    setDrawnIds(new Set());
    setWinner(null);
    setWinnersHistory([]);
    setGroups([]);
    setInputText('');
    setShowClearConfirm(false);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = data.map(row => 
      headers.map(header => row[header] || '').join(',')
    ).join('\n');
    const blob = new Blob([`\uFEFF${headers.join(',')}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lucky Draw Logic
  const startDraw = () => {
    if (people.length === 0) return;
    
    const availablePeople = allowRepeats 
      ? people 
      : people.filter(p => !drawnIds.has(p.id));

    if (availablePeople.length === 0) {
      alert('所有人都已經被抽過了！');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    let counter = 0;
    const maxTicks = 20;
    const interval = setInterval(() => {
      setCurrentDisplayIndex(Math.floor(Math.random() * availablePeople.length));
      counter++;
      
      if (counter >= maxTicks) {
        clearInterval(interval);
        const finalWinner = availablePeople[Math.floor(Math.random() * availablePeople.length)];
        setWinner(finalWinner);
        setWinnersHistory(prev => [finalWinner, ...prev]);
        setIsDrawing(false);
        if (!allowRepeats) {
          setDrawnIds(prev => new Set(prev).add(finalWinner.id));
        }
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 100);
  };

  // Auto Grouping Logic
  const generateGroups = () => {
    if (people.length === 0) return;
    
    const shuffled = [...people].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${Math.floor(i / groupSize) + 1} 組`,
        members: shuffled.slice(i, i + groupSize)
      });
    }
    
    setGroups(newGroups);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#141414]/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">HR Assistant</h1>
          </div>
          
          <nav className="flex gap-1">
            <TabButton 
              active={activeTab === 'list'} 
              onClick={() => setActiveTab('list')}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="名單管理"
            />
            <TabButton 
              active={activeTab === 'draw'} 
              onClick={() => setActiveTab('draw')}
              icon={<Trophy className="w-4 h-4" />}
              label="獎品抽籤"
            />
            <TabButton 
              active={activeTab === 'group'} 
              onClick={() => setActiveTab('group')}
              icon={<Users className="w-4 h-4" />}
              label="自動分組"
            />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#141414]/5">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> 新增名單
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#141414]/60 mb-2">
                        貼上姓名 (以換行或逗號分隔)
                      </label>
                      <textarea
                        className="w-full h-32 p-3 bg-[#F5F5F0] border-none rounded-xl focus:ring-2 focus:ring-[#141414]/10 resize-none outline-none"
                        placeholder="例如：王小明, 李小華, 張大同..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      <button
                        onClick={handleAddFromText}
                        className="w-full mt-2 py-2 bg-[#141414] text-white rounded-xl font-medium hover:bg-[#141414]/90 transition-colors"
                      >
                        新增至名單
                      </button>
                    </div>

                    <div className="pt-4 border-t border-[#141414]/5">
                      <button
                        onClick={loadMockData}
                        className="w-full py-2 bg-[#F5F5F0] text-[#141414] border border-[#141414]/10 rounded-xl font-medium hover:bg-[#141414]/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> 載入模擬名單
                      </button>
                    </div>

                    <div className="pt-4 border-t border-[#141414]/5">
                      <label className="block text-sm font-medium text-[#141414]/60 mb-2">
                        上傳 CSV 檔案
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#141414]/10 rounded-xl cursor-pointer hover:bg-[#F5F5F0] transition-colors">
                        <Upload className="w-8 h-8 text-[#141414]/40 mb-2" />
                        <span className="text-sm text-[#141414]/60">點擊或拖放檔案</span>
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#141414]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">統計資訊</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#141414]/60">總人數</span>
                      <span className="font-bold text-xl">{people.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#141414]/60">已抽中</span>
                      <span className="font-bold text-xl text-emerald-600">{drawnIds.size}</span>
                    </div>
                    <div className="pt-4 border-t border-[#141414]/5 space-y-2">
                      <button
                        onClick={() => exportToCSV(people, '名單匯出', ['name'])}
                        disabled={people.length === 0}
                        className="w-full py-2 bg-white text-[#141414] border border-[#141414]/10 rounded-xl font-medium hover:bg-[#141414]/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FileDown className="w-4 h-4" /> 匯出名單 CSV
                      </button>
                      
                      {!showClearConfirm ? (
                        <button 
                          onClick={() => setShowClearConfirm(true)}
                          disabled={people.length === 0 && drawnIds.size === 0 && winnersHistory.length === 0}
                          className="w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" /> 清空所有名單與紀錄
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={clearAll}
                            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm"
                          >
                            確定清空
                          </button>
                          <button 
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 py-2 bg-[#F5F5F0] text-[#141414]/60 rounded-xl font-medium hover:bg-[#141414]/5 transition-colors text-sm"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                    {duplicateNames.size > 0 && (
                      <div className="pt-4 border-t border-[#141414]/5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          發現 {duplicateNames.size} 個重複姓名
                        </div>
                        <button
                          onClick={removeDuplicates}
                          className="w-full py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-100 transition-colors"
                        >
                          移除重複項
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-[#141414]/5 overflow-hidden">
                  <div className="p-4 border-b border-[#141414]/5 flex items-center justify-between bg-[#F5F5F0]/50">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">當前名單</h2>
                      <span className="text-xs bg-[#141414] text-white px-2 py-1 rounded-full">
                        {people.length} 人
                      </span>
                    </div>
                    {people.length > 0 && (
                      <button 
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> 清空名單
                      </button>
                    )}
                  </div>
                  <div className="max-h-[600px] overflow-y-auto p-4">
                    {people.length === 0 ? (
                      <div className="py-20 text-center text-[#141414]/40">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>目前沒有名單，請從左側新增</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {people.map((person) => (
                          <div 
                            key={person.id}
                            className={`flex items-center justify-between p-3 rounded-xl group transition-all ${
                              duplicateNames.has(person.name) 
                                ? 'bg-amber-50 border border-amber-200 text-amber-900' 
                                : 'bg-[#F5F5F0] hover:bg-[#141414] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="truncate font-medium">{person.name}</span>
                              {duplicateNames.has(person.name) && (
                                <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded uppercase font-bold">重複</span>
                              )}
                            </div>
                            <button 
                              onClick={() => removePerson(person.id)}
                              className={`p-1 rounded transition-all ${
                                duplicateNames.has(person.name)
                                  ? 'hover:bg-amber-200 text-amber-700'
                                  : 'opacity-0 group-hover:opacity-100 hover:bg-white/20'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#141414]/5 text-center space-y-8">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!allowRepeats ? 'bg-[#141414] text-white' : 'bg-[#F5F5F0] text-[#141414]/60'}`}>
                      <CheckCircle2 className="w-4 h-4" /> 不重複抽取
                    </div>
                    <button 
                      onClick={() => setAllowRepeats(!allowRepeats)}
                      className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${allowRepeats ? 'bg-[#141414] text-white' : 'bg-[#F5F5F0] text-[#141414]/60'}`}>
                      <RotateCcw className="w-4 h-4" /> 可重複抽取
                    </div>
                  </div>

                  <div className="relative h-64 flex items-center justify-center bg-[#F5F5F0] rounded-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      {isDrawing ? (
                        <motion.div
                          key="drawing"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-4xl font-bold tracking-tighter"
                        >
                          {people.filter(p => allowRepeats || !drawnIds.has(p.id))[currentDisplayIndex]?.name}
                        </motion.div>
                      ) : winner ? (
                        <motion.div
                          key="winner"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="text-sm uppercase tracking-widest text-[#141414]/40 font-bold">恭喜中獎者</div>
                          <div className="text-6xl font-black text-[#141414]">{winner.name}</div>
                        </motion.div>
                      ) : (
                        <div className="text-[#141414]/20 flex flex-col items-center">
                          <Trophy className="w-16 h-16 mb-4" />
                          <p className="font-medium">準備好開始抽籤了嗎？</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      disabled={isDrawing || people.length === 0}
                      onClick={startDraw}
                      className="w-full py-6 bg-[#141414] text-white rounded-2xl text-xl font-bold hover:bg-[#141414]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#141414]/20"
                    >
                      {isDrawing ? '抽籤中...' : (
                        <>
                          <Play className="w-6 h-6 fill-current" /> 開始抽籤
                        </>
                      )}
                    </button>
                    
                    {people.length === 0 && (
                      <p className="text-red-500 text-sm flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" /> 請先在「名單管理」中新增名單
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-sm border border-[#141414]/5 overflow-hidden h-full flex flex-col">
                  <div className="p-6 border-b border-[#141414]/5 flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" /> 中獎紀錄
                    </h2>
                    <button
                      onClick={() => exportToCSV(winnersHistory, '中獎名單', ['name'])}
                      disabled={winnersHistory.length === 0}
                      className="p-2 hover:bg-[#F5F5F0] rounded-lg transition-colors disabled:opacity-30"
                      title="匯出中獎名單"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {winnersHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[#141414]/20 py-10">
                        <Trophy className="w-8 h-8 mb-2 opacity-10" />
                        <p className="text-sm">尚無中獎紀錄</p>
                      </div>
                    ) : (
                      winnersHistory.map((w, idx) => (
                        <motion.div
                          key={`${w.id}-${idx}`}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center justify-between p-3 bg-[#F5F5F0] rounded-xl"
                        >
                          <span className="font-bold">{w.name}</span>
                          <span className="text-[10px] text-[#141414]/40">#{winnersHistory.length - idx}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                  {winnersHistory.length > 0 && (
                    <div className="p-4 border-t border-[#141414]/5">
                      <button
                        onClick={() => {
                          if (confirm('確定要清除中獎紀錄嗎？')) setWinnersHistory([]);
                        }}
                        className="w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        清除紀錄
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#141414]/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#141414]/60">每組人數</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="2" 
                        max="50"
                        value={groupSize}
                        onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                        className="w-20 p-2 bg-[#F5F5F0] border-none rounded-lg font-bold outline-none"
                      />
                      <span className="text-[#141414]/40">人</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-[#141414]/5 mx-2" />
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-[#141414]/60">預計組數</span>
                    <div className="font-bold">{Math.ceil(people.length / groupSize)} 組</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={generateGroups}
                    disabled={people.length === 0}
                    className="px-8 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-[#141414]/90 transition-all disabled:opacity-50"
                  >
                    開始自動分組
                  </button>
                  {groups.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const text = groups.map(g => `${g.name}:\n${g.members.map(m => `- ${m.name}`).join('\n')}`).join('\n\n');
                          navigator.clipboard.writeText(text);
                          alert('已複製分組結果到剪貼簿！');
                        }}
                        className="p-3 bg-white border border-[#141414]/10 rounded-xl hover:bg-[#F5F5F0] transition-all"
                        title="複製結果"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const csvContent = groups.flatMap(g => 
                            g.members.map(m => `${g.name},${m.name}`)
                          ).join('\n');
                          const blob = new Blob([`組別,姓名\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          const url = URL.createObjectURL(blob);
                          link.setAttribute('href', url);
                          link.setAttribute('download', `分組結果_${new Date().toLocaleDateString()}.csv`);
                          link.style.visibility = 'hidden';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-3 bg-white border border-[#141414]/10 rounded-xl hover:bg-[#F5F5F0] transition-all"
                        title="下載 CSV"
                      >
                        <FileDown className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group, idx) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-[#141414]/5 overflow-hidden"
                    >
                      <div className="p-4 bg-[#141414] text-white flex justify-between items-center">
                        <h3 className="font-bold">{group.name}</h3>
                        <span className="text-xs opacity-60">{group.members.length} 人</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {group.members.map((member) => (
                          <div key={member.id} className="p-2 bg-[#F5F5F0] rounded-lg text-sm font-medium">
                            {member.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center text-[#141414]/20">
                  <LayoutGrid className="w-20 h-20 mx-auto mb-4 opacity-10" />
                  <p className="text-xl font-medium">設定人數並點擊按鈕開始分組</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
        ${active 
          ? 'bg-[#141414] text-white shadow-lg shadow-[#141414]/10' 
          : 'text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
