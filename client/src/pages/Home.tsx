import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Download, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  date: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');

  // Inicializar dados ao montar componente
  useEffect(() => {
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthKey);

    // Carregar tarefas do localStorage
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

  // Salvar tarefas no localStorage sempre que mudarem
  useEffect(() => {
    if (currentMonth) {
      localStorage.setItem(`tasks-${currentMonth}`, JSON.stringify(tasks));
    }
  }, [tasks, currentMonth]);

  const addTask = () => {
    if (!description.trim()) {
      toast.error('Por favor, descreva a tarefa');
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const newTask: Task = {
      id: Date.now().toString(),
      date: dateStr,
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setDescription('');
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
    link.download = `diario-corinthians-${currentMonth}.json`;
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

  const completedCount = tasks.filter(t => t.completed).length;
  const monthName = currentMonth
    ? new Date(`${currentMonth}-01`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header com linha divisória */}
      <header className="relative border-b border-border">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground" />
        <div className="container py-8 pl-8">
          <h1 className="diary-title text-foreground">Diário Corinthians</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {monthName && `Período: ${monthName}`}
            {tasks.length > 0 && ` • ${completedCount}/${tasks.length} concluídas`}
          </p>
        </div>
      </header>

      <main className="container py-8 pl-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de entrada */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Nova Tarefa
              </h2>

              <Textarea
                placeholder="Descreva sua tarefa aqui..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-4 min-h-24 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    addTask();
                  }
                }}
              />

              <Button
                onClick={addTask}
                className="w-full bg-foreground text-background hover:bg-foreground/90 mb-4"
              >
                Adicionar Tarefa
              </Button>

              <div className="space-y-2 border-t border-border pt-4">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>

                <Button
                  onClick={clearMonth}
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Mês
                </Button>
              </div>
            </Card>
          </div>

          {/* Coluna de tarefas */}
          <div className="lg:col-span-2">
            {tasks.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma tarefa ainda. Comece adicionando uma!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="task-card p-4 task-enter hover:shadow-md transition-all"
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
                        <p
                          className={`text-sm font-medium ${
                            task.completed ? 'task-completed' : 'text-foreground'
                          }`}
                        >
                          {task.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.date}
                        </p>
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

      {/* Footer minimalista */}
      <footer className="border-t border-border mt-16">
        <div className="container py-6 pl-8 text-center text-xs text-muted-foreground">
          <p>Diário de Tarefas Corinthians • Dados armazenados localmente no seu navegador</p>
        </div>
      </footer>
    </div>
  );
}
