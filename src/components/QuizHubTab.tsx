import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types.ts';
import { soundFx } from '../utils/audio.ts';
import { CheckCircle2, XCircle, RotateCcw, Upload, FileText, Sparkles } from 'lucide-react';
import { parseQuizScript, parseQuizJson } from '../utils/parser.ts';
import { premadeQuizzes } from '../data/premadeQuizzes.ts';

const defaultStage1Text = `- Question: Which sentence has the correct order of adjectives?
- Options: She bought a red old car, She bought an old red car, She bought red an old car, She bought old red a car
- Answer: She bought an old red car
- Explanation: Age ("old") comes before color ("red") according to standard adjective order.
- Points: 5

- Question: Choose the correct phrase to complete the sentence: "He placed his cup on the ___ table."
- Options: small wooden round, round small wooden, small round wooden, wooden small round
- Answer: small round wooden
- Explanation: Size ("small") comes before shape ("round"), which comes before material ("wooden").
- Points: 5

- Question: Identify the correctly ordered phrase:
- Options: a beautiful Italian leather bag, an Italian beautiful leather bag, a leather beautiful Italian bag, a beautiful leather Italian bag
- Answer: a beautiful Italian leather bag
- Explanation: Opinion ("beautiful") comes before origin ("Italian"), which comes before material ("leather").
- Points: 5

- Question: Which sentence follows the correct adjective order for age, shape, and color?
- Options: A square black new table, A new square black table, A black new square table, A new black square table
- Answer: A new square black table
- Explanation: Age ("new") precedes shape ("square"), which precedes color ("black").
- Points: 5`;

const defaultStage2Text = `- Question: What is 7 multiplied by 8?
- Options: 48, 54, 56, 63
- Answer: 56
- Explanation: 7 × 8 = 56. You can think of it as 7 × 7 (49) + 7 = 56.
- Points: 5

- Question: Which of the following is a square number?
- Options: 28, 36, 42, 50
- Answer: 36
- Explanation: 6 × 6 = 36, making it a perfect square.
- Points: 5

- Question: If 9 × 6 = 54, what is 54 ÷ 6?
- Options: 7, 8, 9, 6
- Answer: 9
- Explanation: Multiplication and division are inverse operations.
- Points: 5

- Question: What is 12 × 11?
- Options: 122, 131, 132, 142
- Answer: 132
- Explanation: 12 × 10 = 120, plus 12 = 132.
- Points: 5`;

export const QuizHubTab: React.FC<{
  onQuestionsUpdated?: (questions: QuizQuestion[]) => void;
}> = ({ onQuestionsUpdated }) => {
  const [selectedStage, setSelectedStage] = useState<string>('stage1');
  const [rawText, setRawText] = useState<string>(defaultStage1Text);
  const [aiInput, setAiInput] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/parse-to-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput }),
      });
      if (!response.ok) throw new Error('Failed to generate quiz');
      const generatedQuestions = await response.json();
      setQuestions(generatedQuestions);
      if (onQuestionsUpdated) onQuestionsUpdated(generatedQuestions);
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = (text: string, isJson: boolean) => {
    setLoading(true);
    const parsed = isJson ? parseQuizJson(text) : parseQuizScript(text);
    setQuestions(parsed);
    setUserAnswers({});
    setCheckedAnswers({});
    if (onQuestionsUpdated) onQuestionsUpdated(parsed);
    setLoading(false);
  };

  useEffect(() => {
    loadQuiz(rawText, false);
  }, []);

  const handleStageChange = (stg: string) => {
    setSelectedStage(stg);
    
    const premade = premadeQuizzes.find(q => q.id === stg);
    if (premade) {
        setQuestions(premade.questions);
        setUserAnswers({});
        setCheckedAnswers({});
        if (onQuestionsUpdated) onQuestionsUpdated(premade.questions);
        return;
    }

    let txt = rawText;
    if (stg === 'stage1') txt = defaultStage1Text;
    else if (stg === 'stage2') txt = defaultStage2Text;
    setRawText(txt);
    loadQuiz(txt, false);
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const isJson = file.name.endsWith('.json');
      loadQuiz(content, isJson);
    };
    reader.readAsText(file);
  };

  const checkAnswer = (qId: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !userAnswers[qId]) return;

    setCheckedAnswers((prev) => ({ ...prev, [qId]: true }));
    const isCorrect = userAnswers[qId].trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (isCorrect) soundFx.playCorrect();
    else soundFx.playIncorrect();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md border border-indigo-700/50">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Quiz Academy</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Quiz Hub & Knowledge Base
          </h2>
          <p className="text-indigo-200/90 text-sm mt-1 max-w-xl">
            Challenge yourself with interactive quizzes. Use AI to generate quizzes from your study notes or upload your own files.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Stage Quiz Hub</h2>
          <p className="text-slate-500 text-sm">
            Select standard syllabus stages or upload your custom structured quiz files with explanations.
          </p>
        </div>

        {/* Stage Selector Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="stage1">Stage 1: English Adjectives Syllabus</option>
              <option value="stage2">Stage 2: Math Foundations & Tables</option>
              <option value="custom">Custom Uploaded Stage</option>
              {premadeQuizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>

          <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
            {questions.length} Questions Loaded
          </span>
        </div>

        {/* Upload and Text Editor Accordion */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <label className="font-semibold text-slate-700 text-xs flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Upload Quiz File (.txt)</span>
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Quiz with AI:</span>
            </label>
            <textarea
              rows={5}
              placeholder="Paste your notes or any text here, and I'll create a quiz..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-indigo-200 rounded-2xl focus:outline-none focus:border-indigo-500 bg-indigo-50/50"
            />
            <button
              type="button"
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-2xl text-xs transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="p-8 bg-amber-50 text-amber-800 text-sm rounded-3xl text-center border border-amber-200">
              No questions parsed correctly. Please check that Question and Answer lines are included.
            </div>
          ) : (
            questions.map((q, idx) => {
              const isChecked = checkedAnswers[q.id];
              const chosen = userAnswers[q.id];
              const isCorrect = chosen?.trim().toLowerCase() === q.answer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                      {q.points} Pts
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800 text-base">{q.question}</p>

                  {q.type === 'sorting' ? (
                    <SortingQuestion 
                      question={q} 
                      onAnswer={(ans) => {
                        setUserAnswers(prev => ({ ...prev, [q.id]: ans }));
                        setCheckedAnswers(prev => ({ ...prev, [q.id]: false }));
                      }}
                      currentAnswer={chosen}
                    />
                  ) : (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center space-x-3 p-3 border rounded-2xl cursor-pointer transition ${
                            chosen === opt
                              ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium'
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz_q_${q.id}`}
                            value={opt}
                            checked={chosen === opt}
                            onChange={() => {
                              setUserAnswers((prev) => ({ ...prev, [q.id]: opt }));
                              setCheckedAnswers((prev) => ({ ...prev, [q.id]: false }));
                            }}
                            className="text-indigo-600 w-4 h-4"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => checkAnswer(q.id)}
                      disabled={!chosen}
                      className="bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      Check Answer
                    </button>
                  </div>

                  {isChecked && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 font-bold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! 🎉 +{q.points} Points</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Incorrect. Correct answer is: <strong>{q.answer}</strong></span>
                          </>
                        )}
                      </div>
                      {q.explanation && (
                        <p className="text-slate-600 pt-1 text-[11px] leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
  );
};
