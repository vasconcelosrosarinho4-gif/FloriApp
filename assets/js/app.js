import { deleteRecord, getAllRecords, saveRecord } from './db.js';
import { renderActivities, renderPlants, renderTasks } from './modules/UI.js';

const activityDialog = document.querySelector('#activity-dialog');
const activityForm = document.querySelector('#activity-form');
const accountDialog = document.querySelector('#account-dialog');
const accountForm = document.querySelector('#account-form');
const loginDialog = document.querySelector('#login-dialog');
const loginForm = document.querySelector('#login-form');
const activityList = document.querySelector('#activity-list');
const dashboardActivities = document.querySelector('#dashboard-activities');
const taskList = document.querySelector('#task-list');
const plantsGrid = document.querySelector('#plants-grid');
const statusMessage = document.querySelector('#connection-status');
const views = [...document.querySelectorAll('.view')];
const demoGardener = { id: 'gardener-demo', name: 'Jardineira de Teste', role: 'Responsável de jardim', accountType: 'demo' };

const samplePlants = [
  { id: 'demo-plant-a', label: 'Orquídea', interest: 'Rega moderada e luz indireta', progress: 76, color: 'mint' },
  { id: 'demo-plant-b', label: 'Lavanda', interest: 'Sol directo e drenagem leve', progress: 84, color: 'peach' },
  { id: 'demo-plant-c', label: 'Suculenta', interest: 'Humidade baixa e exposição solar', progress: 61, color: 'yellow' }
];

function dateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const sampleActivities = [
  { id: 'demo-activity-1', title: 'Rega dos canteiros', area: 'Cuidados diários', date: dateOffset(0), time: '08:30', group: 'Jardim exterior' },
  { id: 'demo-activity-2', title: 'Adubação de rosas', area: 'Nutrição e solo', date: dateOffset(1), time: '11:00', group: 'Área de flores' },
  { id: 'demo-activity-3', title: 'Podas da horta', area: 'Manutenção', date: dateOffset(2), time: '09:15', group: 'Zona de ervas' }
];

const sampleTasks = [
  { id: 'demo-task-1', title: 'Verificar humidade do vaso da orquídea', done: false },
  { id: 'demo-task-2', title: 'Recolher folhas secas da lavanda', done: false },
  { id: 'demo-task-3', title: 'Preparar a mistura de fertilizante', done: true }
];

async function seedStore(store, records) {
  const existing = await getAllRecords(store);
  if (existing.length === 0) await Promise.all(records.map(record => saveRecord(store, record)));
}

async function refreshDashboard() {
  const [activities, tasks, plants] = await Promise.all([
    getAllRecords('activities'),
    getAllRecords('tasks'),
    getAllRecords('plants')
  ]);
  const orderedActivities = activities.sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`));
  renderActivities(activityList, orderedActivities);
  renderActivities(dashboardActivities, orderedActivities.slice(0, 3));
  renderTasks(taskList, tasks);
  renderPlants(plantsGrid, plants);
  document.querySelector('#activity-count').textContent = String(activities.length);
  document.querySelector('#plants-count').textContent = String(plants.length);
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
document.querySelectorAll('[data-close-account]').forEach(button => button.addEventListener('click', () => accountDialog.close()));
document.querySelectorAll('[data-close-login]').forEach(button => button.addEventListener('click', () => loginDialog.close()));
document.querySelectorAll('[data-open-account]').forEach(button => button.addEventListener('click', () => {
  accountForm.reset();
  accountDialog.showModal();
}));
document.querySelectorAll('[data-open-login]').forEach(button => button.addEventListener('click', () => {
  loginForm.reset();
  loginDialog.showModal();
}));

accountForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const name = formData.get('name').trim();
  const role = formData.get('role').trim() || 'Gestor de jardim';
  const email = formData.get('email').trim();

  const account = {
    id: `account-${crypto.randomUUID()}`,
    name,
    role,
    email,
    accountType: 'custom'
  };

  await saveRecord('educators', account);
  document.querySelector('#account-name').textContent = account.name;
  document.querySelector('#account-role').textContent = 'Conta pessoal';
  document.querySelector('#educator-name').textContent = account.name;
  accountDialog.close();
  statusMessage.textContent = 'Conta criada com sucesso';
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const educators = await getAllRecords('educators');
  const match = educators.find(item => String(item.email || '').trim().toLowerCase() === email);

  if (!match) {
    statusMessage.textContent = 'Conta não encontrada. Cria uma conta primeiro.';
    loginDialog.close();
    return;
  }

  document.querySelector('#account-name').textContent = match.name;
  document.querySelector('#account-role').textContent = match.role || 'Conta pessoal';
  document.querySelector('#educator-name').textContent = match.name;
  loginDialog.close();
  statusMessage.textContent = `Bem-vindo(a), ${match.name}`;
});

activityForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(activityForm);
  await saveRecord('activities', {
    id: `activity-${crypto.randomUUID()}`,
    title: formData.get('title').trim(),
    area: formData.get('area'),
    date: formData.get('date'),
    time: formData.get('time'),
    group: formData.get('group').trim() || 'Jardim'
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
  await seedStore('educators', [demoGardener]);
  await seedStore('activities', sampleActivities);
  await seedStore('tasks', sampleTasks);
  await seedStore('plants', samplePlants);
  const educators = await getAllRecords('educators');
  const educator = educators.find(item => item.id === demoGardener.id) || educators[0] || demoGardener;
  document.querySelector('#account-name').textContent = educator.name;
  document.querySelector('#account-role').textContent = educator.accountType === 'demo' ? 'Perfil de demonstração' : (educator.role || 'Conta pessoal');
  document.querySelector('#educator-name').textContent = educator.name;
  await refreshDashboard();

  if (educator.accountType === 'demo') {
    window.setTimeout(() => {
      if (accountDialog && !accountDialog.open) {
        accountDialog.showModal();
      }
    }, 250);
  }
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
