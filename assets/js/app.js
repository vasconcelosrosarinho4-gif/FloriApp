import { deleteRecord, getAllRecords, saveRecord } from './db.js';
import { renderActivities, renderChildren, renderTasks } from './modules/UI.js';

const activityDialog = document.querySelector('#activity-dialog');
const activityForm = document.querySelector('#activity-form');
const activityList = document.querySelector('#activity-list');
const dashboardActivities = document.querySelector('#dashboard-activities');
const taskList = document.querySelector('#task-list');
const childrenGrid = document.querySelector('#children-grid');
const statusMessage = document.querySelector('#connection-status');
const views = [...document.querySelectorAll('.view')];
const demoEducator = { id: 'educator-demo', name: 'Educadora de Teste', role: 'Educadora de infância', accountType: 'demo' };

const sampleChildren = [
  { id: 'demo-a', label: 'Criança A', interest: 'Construção e exploração', progress: 68, color: 'mint' },
  { id: 'demo-b', label: 'Criança B', interest: 'Histórias e expressão', progress: 82, color: 'peach' },
  { id: 'demo-c', label: 'Criança C', interest: 'Movimento e descoberta', progress: 54, color: 'yellow' }
];

function dateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const sampleActivities = [
  { id: 'demo-activity-1', title: 'Ateliê das cores de outono', area: 'Expressão plástica', date: dateOffset(0), time: '10:00', group: 'Sala dos 5 anos' },
  { id: 'demo-activity-2', title: 'Histórias que crescem', area: 'Linguagem e comunicação', date: dateOffset(1), time: '11:00', group: 'Grupo da manhã' },
  { id: 'demo-activity-3', title: 'Pequenos exploradores da natureza', area: 'Conhecimento do mundo', date: dateOffset(2), time: '09:30', group: 'Sala dos 5 anos' }
];

const sampleTasks = [
  { id: 'demo-task-1', title: 'Preparar materiais para o ateliê', done: false },
  { id: 'demo-task-2', title: 'Organizar a leitura da semana', done: false },
  { id: 'demo-task-3', title: 'Rever o planeamento do grupo', done: true }
];

async function seedStore(store, records) {
  const existing = await getAllRecords(store);
  if (existing.length === 0) await Promise.all(records.map(record => saveRecord(store, record)));
}

async function refreshDashboard() {
  const [activities, tasks, children] = await Promise.all([
    getAllRecords('activities'),
    getAllRecords('tasks'),
    getAllRecords('children')
  ]);
  const orderedActivities = activities.sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`));
  renderActivities(activityList, orderedActivities);
  renderActivities(dashboardActivities, orderedActivities.slice(0, 3));
  renderTasks(taskList, tasks);
  renderChildren(childrenGrid, children);
  document.querySelector('#activity-count').textContent = String(activities.length);
  document.querySelector('#children-count').textContent = String(children.length);
  document.querySelector('#task-count').textContent = String(tasks.filter(task => !task.done).length);
}

function setView(name) {
  views.forEach(view => { view.hidden = view.id !== `view-${name}`; });
  document.querySelectorAll('[data-view-target]').forEach(button => {
    const active = button.dataset.viewTarget === name;
    button.classList.toggle('is-active', active);
    if (!button.classList.contains('nav-item')) return;
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-view-target]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewTarget)));

document.querySelectorAll('[data-open-activity]').forEach(button => {
  button.addEventListener('click', () => {
    activityForm.reset();
    activityForm.elements.date.value = dateOffset(0);
    activityDialog.showModal();
    activityForm.elements.title.focus();
  });
});

document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => activityDialog.close()));

activityForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(activityForm);
  await saveRecord('activities', {
    id: `activity-${crypto.randomUUID()}`,
    title: formData.get('title').trim(),
    area: formData.get('area'),
    date: formData.get('date'),
    time: formData.get('time'),
    group: formData.get('group').trim() || 'Grupo'
  });
  activityDialog.close();
  await refreshDashboard();
  statusMessage.textContent = 'Atividade guardada neste dispositivo';
});

document.addEventListener('click', async event => {
  const deleteButton = event.target.closest('[data-delete-activity]');
  if (!deleteButton) return;
  await deleteRecord('activities', deleteButton.dataset.deleteActivity);
  await refreshDashboard();
  statusMessage.textContent = 'Atividade removida';
});

taskList.addEventListener('change', async event => {
  const checkbox = event.target.closest('[data-task-id]');
  if (!checkbox) return;
  await saveRecord('tasks', { id: checkbox.dataset.taskId, title: checkbox.dataset.taskTitle, done: checkbox.checked });
  await refreshDashboard();
});

document.querySelector('#today-date').textContent = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
window.addEventListener('online', () => { statusMessage.textContent = 'Ligação disponível · dados guardados neste dispositivo'; });
window.addEventListener('offline', () => { statusMessage.textContent = 'Sem ligação · podes continuar a trabalhar'; });

try {
  await seedStore('educators', [demoEducator]);
  await seedStore('activities', sampleActivities);
  await seedStore('tasks', sampleTasks);
  await seedStore('children', sampleChildren);
  const educators = await getAllRecords('educators');
  const educator = educators.find(item => item.id === demoEducator.id) || demoEducator;
  document.querySelector('#account-name').textContent = educator.name;
  document.querySelector('#account-role').textContent = educator.accountType === 'demo' ? 'Perfil de demonstração' : educator.role;
  document.querySelector('#educator-name').textContent = educator.name;
  await refreshDashboard();
} catch (error) {
  statusMessage.textContent = 'Não foi possível abrir o armazenamento local';
  console.error('Erro ao carregar a FloriApp:', error);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Não foi possível registar o Service Worker:', error);
    });
  });
}
