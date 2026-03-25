import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';

export interface TableRowItem {
  name: string;
  completed: boolean;
  comment: string;
  youtubeUrls: string[];
  newYoutubeUrl: string; // binding for input
  showYoutubePopup: boolean;
  shortNotesToggle: boolean;
  notesToggle: boolean;
  shortNotes: string;
  notes: string;
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryObj: Record<string, string> = {};
  subCategoryObj: Record<string, string[]> = {};
  valueObj: Record<string, any> = {};

  showAddPopup = false;
  popupType: 'category' | 'subcategory' | 'value' = 'category';
  popupInputValue = '';
  popupError = '';

  categoryKeys: string[] = [];
  selectedCategory = '';
  
  subCategories: string[] = [];
  selectedSubCategory = '';

  tableData: TableRowItem[] = [];
  filteredTableData: TableRowItem[] = [];
  searchQuery = '';

  isSaving = false;
  saveMessage = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryKeys = Object.keys(this.categoryObj);
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.categoryObj) this.categoryObj = res.data.categoryObj;
          if (res.data.subCategoryObj) this.subCategoryObj = res.data.subCategoryObj;
          if (res.data.valueObj) this.valueObj = res.data.valueObj;
          this.categoryKeys = Object.keys(this.categoryObj);
          
          if (this.selectedCategory) {
            this.onCategoryChange();
          }
        }
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      }
    });
  }

  syncTableDataToValueObj(): void {
    if (this.selectedSubCategory && this.tableData.length > 0) {
      // Store the fully synchronized state items
      this.valueObj[this.selectedSubCategory] = [...this.tableData];
    }
  }

  saveData(): void {
    this.syncTableDataToValueObj();
    this.isSaving = true;
    this.saveMessage = '';

    const payload = {
      categoryObj: this.categoryObj,
      subCategoryObj: this.subCategoryObj,
      valueObj: this.valueObj
    };

    this.categoryService.saveCategories(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.saveMessage = 'Data correctly saved to backend JSONs.';
          setTimeout(() => this.saveMessage = '', 3000);
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Failed to save data', err);
        this.saveMessage = 'Failed to save data.';
        this.isSaving = false;
      }
    });
  }

  onCategoryChange(): void {
    this.selectedSubCategory = '';
    this.tableData = [];
    this.filteredTableData = [];
    this.searchQuery = '';
    
    if (this.selectedCategory) {
      this.subCategories = this.subCategoryObj[this.selectedCategory] || [];
    } else {
      this.subCategories = [];
    }
  }

  onSubCategoryChange(): void {
    // If navigating away from a valid populated subcategory, auto-sync it back to valueObj
    if (this.tableData.length > 0) {
      this.syncTableDataToValueObj();
    }

    this.tableData = [];
    this.filteredTableData = [];
    this.searchQuery = '';

    if (this.selectedSubCategory) {
      const vals = this.valueObj[this.selectedSubCategory];
      const items = Array.isArray(vals) ? vals : (vals ? [vals] : []);
      
      this.tableData = items.map((item: any) => {
        // Handle case where items are already previously saved objects with state
        if (typeof item === 'object' && item !== null) {
          return {
            name: item.name || '',
            completed: item.completed || false,
            comment: item.comment || '',
            youtubeUrls: item.youtubeUrls || [],
            newYoutubeUrl: item.newYoutubeUrl || '',
            showYoutubePopup: item.showYoutubePopup || false,
            shortNotesToggle: item.shortNotesToggle || false,
            notesToggle: item.notesToggle || false,
            shortNotes: item.shortNotes || '',
            notes: item.notes || ''
          };
        }
        // Handle legacy hardcoded string arrays fallback
        return {
          name: typeof item === 'string' ? item : '',
          completed: false,
          comment: '',
          youtubeUrls: [],
          newYoutubeUrl: '',
          showYoutubePopup: false,
          shortNotesToggle: false,
          notesToggle: false,
          shortNotes: '',
          notes: ''
        };
      });
      this.filterTable();
    }
  }

  filterTable(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTableData = [...this.tableData];
      return;
    }
    const lowerQ = this.searchQuery.toLowerCase();
    this.filteredTableData = this.tableData.filter(item => item.name.toLowerCase().includes(lowerQ));
  }

  toggleYoutubePopup(item: TableRowItem): void {
    item.showYoutubePopup = !item.showYoutubePopup;
  }

  addYoutubeUrl(item: TableRowItem): void {
    if (item.newYoutubeUrl && item.newYoutubeUrl.trim() !== '') {
      item.youtubeUrls.push(item.newYoutubeUrl.trim());
      item.newYoutubeUrl = '';
    }
  }

  removeYoutubeUrl(item: TableRowItem, index: number): void {
    item.youtubeUrls.splice(index, 1);
  }

  getCategoryLabel(key: string): string {
    return this.categoryObj[key] || key;
  }

  openAddPopup(type: 'category' | 'subcategory' | 'value'): void {
    this.popupType = type;
    this.popupInputValue = '';
    this.popupError = '';
    this.showAddPopup = true;
  }

  closeAddPopup(): void {
    this.showAddPopup = false;
    this.popupInputValue = '';
    this.popupError = '';
  }

  submitAddPopup(): void {
    if (!this.popupInputValue.trim()) {
      this.popupError = 'Name cannot be empty.';
      return;
    }
    const val = this.popupInputValue.trim();
    this.popupError = '';

    if (this.popupType === 'category') {
      const key = val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
      
      if (!key) {
        this.popupError = 'Invalid category name.';
        return;
      }
      if (this.categoryObj[key] || Object.values(this.categoryObj).some(existing => existing.toLowerCase() === val.toLowerCase())) {
        this.popupError = 'This Category already exists.';
        return;
      }
      
      this.categoryObj[key] = val;
      this.categoryKeys = Object.keys(this.categoryObj);
      this.selectedCategory = key;
      this.onCategoryChange();

    } else if (this.popupType === 'subcategory') {
      if (!this.selectedCategory) return;
      const key = val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
      
      if (!key) {
        this.popupError = 'Invalid sub category name.';
        return;
      }
      if (!this.subCategoryObj[this.selectedCategory]) {
        this.subCategoryObj[this.selectedCategory] = [];
      }
      if (this.subCategoryObj[this.selectedCategory].includes(key)) {
        this.popupError = 'This Sub Category already exists under the selected Primary Category.';
        return;
      }
      
      this.subCategoryObj[this.selectedCategory].push(key);
      this.subCategories = this.subCategoryObj[this.selectedCategory];
      this.selectedSubCategory = key;
      this.onSubCategoryChange();

    } else if (this.popupType === 'value') {
      if (!this.selectedSubCategory) return;
      
      const exists = this.tableData.some(item => item.name.toLowerCase() === val.toLowerCase());
      if (exists) {
        this.popupError = 'This Value already exists in this table.';
        return;
      }

      this.tableData.push({
        name: val,
        completed: false,
        comment: '',
        youtubeUrls: [],
        newYoutubeUrl: '',
        showYoutubePopup: false,
        shortNotesToggle: false,
        notesToggle: false,
        shortNotes: '',
        notes: ''
      });
      this.filterTable();
    }
    this.closeAddPopup();
  }
}

