import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Download, RotateCcw, CheckCircle2, Circle, Search, Moon, Sun, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

type Category = 'trabalho' | 'pessoal' | 'projetos' | 'saude' | 'outro';
type Priority = 'baixa' | 'media' | 'alta';

interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'trabalho', label: 'Trabalho', icon: '💼' },
  { value: 'pessoal', label: 'Pessoal', icon: '❤️' },
  { value: 'projetos', label: 'Projetos', icon: '🚀' },
  { value: 'saude', label: 'Saúde', icon: '💪' },
  { value: 'outro', label: 'Outro', icon: '⭐' },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'baixa', label: 'Baixa', color: 'text-green-600' },
  { value: 'media', label: 'Média', color: 'text-yellow-600' },
  { value: 'alta', label: 'Alta', color: 'text-red-600' },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('pessoal');
  const [priority, setPriority] = useState<Priority>('media');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'todas'>('todas');
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthKey);

    const stored = localStorage.getItem(`tasks-${monthKey}`);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setTasks([]);
      }
    }
  }, []);

  useEffect(() => {
    if (currentMonth) {
      localStorage.setItem(`tasks-${currentMonth}`, JSON.stringify(tasks));
    }
  }, [tasks, currentMonth]);

  const addTask = () => {
    if (!title.trim()) {
      toast.error('Por favor, descreva a tarefa');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setPriority('media');
    toast.success('Tarefa adicionada com sucesso');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Tarefa removida');
  };

  const exportData = () => {
    if (tasks.length === 0) {
      toast.error('Nenhuma tarefa para exportar');
      return;
    }

    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diario-tarefas-${currentMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso');
  };

  const clearMonth = () => {
    if (tasks.length === 0) {
      toast.error('Nenhuma tarefa para limpar');
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja limpar todas as tarefas deste mês? Exporte os dados antes se quiser guardá-los.'
    );

    if (confirmed) {
      setTasks([]);
      toast.success('Todas as tarefas foram removidas');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'todas' || task.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const monthName = currentMonth
    ? new Date(`${currentMonth}-01`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const getCategoryColor = (cat: Category) => {
    const colors: Record<Category, string> = {
      trabalho: 'category-trabalho',
      pessoal: 'category-pessoal',
      projetos: 'category-projetos',
      saude: 'category-saude',
      outro: 'category-outro',
    };
    return colors[cat];
  };

  const getCategoryIcon = (cat: Category) => {
    return CATEGORIES.find(c => c.value === cat)?.icon || '⭐';
  };

  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="diary-title">Diário de Tarefas</h1>
            <p className="diary-subtitle">
              {monthName && `${monthName}`}
              {tasks.length > 0 && ` • ${completedCount}/${tasks.length} concluídas`}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Barra de Progresso */}
        {tasks.length > 0 && (
          <div className="container px-4 pb-4">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Entrada de Tarefas */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">Nova Tarefa</h2>

              <Textarea
                placeholder="Descreva sua tarefa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 min-h-20 resize-none search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    addTask();
                  }
                }}
              />

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={addTask}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-4 font-semibold"
              >
                Adicionar Tarefa
              </Button>

              <div className="space-y-2 border-t border-border pt-4">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>

                <Button
                  onClick={clearMonth}
                  variant="outline"
                  className="w-full justify-start text-sm text-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Mês
                </Button>
              </div>
            </Card>
          </div>

          {/* Coluna Principal - Tarefas */}
          <div className="lg:col-span-3">
            {/* Busca e Filtros */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 search-input"
                />
              </div>

              {/* Filtros por Categoria */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('todas')}
                  className={`filter-button ${filterCategory === 'todas' ? 'active' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Todas
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`filter-button ${filterCategory === cat.value ? 'active' : ''}`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Tarefas */}
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  {tasks.length === 0
                    ? 'Nenhuma tarefa ainda. Comece adicionando uma!'
                    : 'Nenhuma tarefa encontrada com esses filtros.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="task-card p-4 task-enter hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 text-foreground hover:text-accent transition-colors flex-shrink-0"
                        aria-label="Toggle task"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p
                            className={`text-sm font-medium ${
                              task.completed ? 'task-completed' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`category-badge ${getCategoryColor(task.category)}`}>
                            {getCategoryIcon(task.category)} {CATEGORIES.find(c => c.value === task.category)?.label}
                          </span>

                          <span className={`text-xs font-semibold ${PRIORITIES.find(p => p.value === task.priority)?.color}`}>
                            {PRIORITIES.find(p => p.value === task.priority)?.label}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          <p>Diário de Tarefas • Dados armazenados localmente no seu navegador</p>
        </div>
      </footer>
    </div>
  );
}
