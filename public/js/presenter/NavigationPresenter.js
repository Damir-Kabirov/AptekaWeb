export default class NavigationPresenter {
    constructor(container) {
      this.container = container;
    }
  
    init() {
      this.asideHandler();
    }
  
    asideHandler() {
      const sidebarBtn = this.container.querySelector('.sidebar-toggle');
      const sidebar = this.container.querySelector('.sidebar');
      if (sidebarBtn) {
        sidebarBtn.addEventListener('click', () => {
          sidebar.classList.toggle('d-n');
        });
      }
  
      const submenuItems = this.container.querySelectorAll('.nav-item');
      submenuItems.forEach(item => {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          const submenu = this.querySelector('.submenu');
          if (submenu) {
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
          }
        });
      });
    }
  }