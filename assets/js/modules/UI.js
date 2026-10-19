export function renderActivities(container, activities) {
  if (!container) return;
  if (activities.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = 'Ainda não há atividades planeadas.';
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...activities.map(activity => {
    const item = document.createElement('article');
    item.className = 'activity-item';
    const date = document.createElement('div');
    date.className = 'activity-date';
    date.textContent = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(new Date(`${activity.date}T12:00:00`));
    const content = document.createElement('div');
    content.className = 'activity-content';
    const title = document.createElement('h3');
    title.textContent = activity.title;
    const details = document.createElement('p');
    details.textContent = `${activity.time} · ${activity.area}${activity.group ? ` · ${activity.group}` : ''}`;
    content.append(title, details);
    const remove = document.createElement('button');
    remove.className = 'remove-activity';
    remove.type = 'button';
    remove.dataset.deleteActivity = activity.id;
    remove.setAttribute('aria-label', `Remover ${activity.title}`);
    remove.textContent = 'Remover';
    item.append(date, content, remove);
    return item;
  }));
}

export function renderTasks(container, tasks) {
  container.replaceChildren(...tasks.map(task => {
    const label = document.createElement('label');
    label.className = `task-item${task.done ? ' is-done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.dataset.taskId = task.id;
    checkbox.dataset.taskTitle = task.title;
    const title = document.createElement('span');
    title.textContent = task.title;
    label.append(checkbox, title);
    return label;
  }));
}

export function renderChildren(container, children) {
  container.replaceChildren(...children.map(child => {
    const article = document.createElement('article');
    article.className = `child-item child-${child.color}`;
    const avatar = document.createElement('span');
    avatar.className = 'child-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = child.label.slice(-1);
    const name = document.createElement('h2');
    name.textContent = child.label;
    const caption = document.createElement('p');
    caption.className = 'child-caption';
    caption.textContent = 'Interesse em destaque';
    const interest = document.createElement('p');
    interest.className = 'child-interest';
    interest.textContent = child.interest;
    const progressLabel = document.createElement('label');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = `Experiências registadas · ${child.progress}%`;
    const progress = document.createElement('progress');
    progress.max = 100;
    progress.value = child.progress;
    progress.setAttribute('aria-label', `Exemplo de progresso: ${child.progress}%`);
    article.append(avatar, name, caption, interest, progressLabel, progress);
    return article;
  }));
}
