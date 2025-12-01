// src/primevue.js
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

// Componentes de PrimeVue
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import DataView from 'primevue/dataview';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Panel from 'primevue/panel';
import Calendar from 'primevue/calendar';
import InputMask from 'primevue/inputmask';
import ProgressSpinner from 'primevue/progressspinner';
import Sidebar from 'primevue/sidebar';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import Tag from 'primevue/tag'; // NUEVO
import TabView from 'primevue/tabview'; // NUEVO
import TabPanel from 'primevue/tabpanel'; // NUEVO
import Select from 'primevue/select'; // NUEVO
import Checkbox from 'primevue/checkbox'; // NUEVO
import ConfirmationService from 'primevue/confirmationservice'; // NUEVO
import ConfirmDialog from 'primevue/confirmdialog'; // NUEVO

export default (app) => {
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: '.app-dark',
                cssLayer: false
            }
        }
    });

    app.use(ToastService);
    app.use(ConfirmationService);

    // Registro de componentes
    app.component('pv-button', Button);
    app.component('pv-select-button', SelectButton);
    app.component('pv-float-label', FloatLabel);
    app.component('pv-input-text', InputText);
    app.component('pv-multi-select', MultiSelect);
    app.component('pv-dropdown', Dropdown);
    app.component('pv-data-view', DataView);
    app.component('pv-textarea', Textarea);
    app.component('pv-input-number', InputNumber);
    app.component('pv-data-table', DataTable);
    app.component('pv-column', Column);
    app.component('pv-column-group', ColumnGroup);
    app.component('pv-row', Row);
    app.component('pv-panel', Panel);
    app.component('pv-calendar', Calendar);
    app.component('pv-input-mask', InputMask);
    app.component('pv-progress-spinner', ProgressSpinner);
    app.component('pv-sidebar', Sidebar);
    app.component('pv-card', Card);
    app.component('pv-dialog', Dialog);
    app.component('pv-toast', Toast);
    app.component('pv-badge', Badge);
    app.component('pv-tag', Tag); // NUEVO
    app.component('pv-tab-view', TabView); // NUEVO
    app.component('pv-tab-panel', TabPanel); // NUEVO
    app.component('pv-select', Select); // NUEVO
    app.component('pv-checkbox', Checkbox); // NUEVO
    app.component('pv-confirm-dialog', ConfirmDialog); // NUEVO

    // Directivas
    app.directive('badge', BadgeDirective);
};