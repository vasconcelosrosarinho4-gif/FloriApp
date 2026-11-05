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

export function renderPlants(container, plants) {
  if (!container) return;
  if (plants.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = 'Ainda não tens plantas registadas. Adiciona a primeira para começar a tua coleção.';
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...plants.map(plant => {
    const article = document.createElement('article');
    article.className = `plant-item plant-${plant.color}`;
    const avatar = document.createElement('span');
    avatar.className = 'plant-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = plant.label.slice(0, 1);
    const name = document.createElement('h2');
    name.textContent = plant.label;
    const caption = document.createElement('p');
    caption.className = 'plant-caption';
    caption.textContent = 'Cuidados em destaque';
    const interest = document.createElement('p');
    interest.className = 'plant-interest';
    interest.textContent = plant.interest;
    const progressLabel = document.createElement('label');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = `Saúde da planta · ${plant.progress}%`;
    const progress = document.createElement('progress');
    progress.max = 100;
    progress.value = plant.progress;
    progress.setAttribute('aria-label', `Estado de saúde: ${plant.progress}%`);
    article.append(avatar, name, caption, interest, progressLabel, progress);
    return article;
  }));
}

export function renderCatalog(container, products, search = '', category = 'all', location = 'all') {
  if (!container) return;
  const normalizeText = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
  const query = normalizeText(search.trim());
  const matchingProducts = products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesLocation = location === 'all' || product.location === location;
    const searchableText = normalizeText(`${product.name} ${product.scientificName || ''} ${product.description} ${product.category} ${product.location || ''} ${product.light || ''} ${product.water || ''} ${product.soil || ''} ${product.size || ''} ${product.flowering || ''} ${product.pets || ''} ${product.keywords || ''}`);
    return matchesCategory && matchesLocation && searchableText.includes(query);
  });

  if (matchingProducts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-message';
    empty.textContent = 'Não encontrámos plantas com esses filtros. Experimenta outras palavras ou categorias.';
    container.replaceChildren(empty);
    return;
  }

  container.replaceChildren(...matchingProducts.map(product => {
    const article = document.createElement('article');
    article.className = `catalog-card catalog-${product.color}`;
    const illustration = document.createElement('div');
    illustration.className = 'catalog-illustration';
    illustration.setAttribute('aria-hidden', 'true');
    illustration.textContent = product.symbol;
    const details = document.createElement('div');
    details.className = 'catalog-details';
    const categoryLabel = document.createElement('span');
    categoryLabel.className = 'catalog-category';
    categoryLabel.textContent = product.category;
    const name = document.createElement('h2');
    name.textContent = product.name;
    const scientificName = document.createElement('p');
    scientificName.className = 'catalog-scientific-name';
    scientificName.textContent = product.scientificName || '';
    const description = document.createElement('p');
    description.textContent = product.description;
    details.append(categoryLabel, name);
    if (product.scientificName) details.append(scientificName);
    details.append(description);

    const facts = document.createElement('dl');
    facts.className = 'catalog-facts';
    [
      ['Local', product.location],
      ['Luz', product.light],
      ['Rega', product.water],
      ['Solo', product.soil],
      ['Porte', product.size],
      ['Floração', product.flowering],
      ['Atenção', product.pets]
    ].forEach(([label, value]) => {
      if (!value) return;
      const row = document.createElement('div');
      const term = document.createElement('dt');
      term.textContent = label;
      const definition = document.createElement('dd');
      definition.textContent = value;
      row.append(term, definition);
      facts.append(row);
    });
    details.append(facts);
    article.append(illustration, details);
    return article;
  }));
}
