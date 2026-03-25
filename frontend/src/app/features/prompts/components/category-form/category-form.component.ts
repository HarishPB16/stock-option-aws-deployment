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
  categoryObj: Record<string, string> = {
    english: "English",
    technical: "Technical",
    aiDevops: "AI / DevOps / AWS",
    psychology: "Psychology",
    health: "Health",
    utkarshVideo: "Utkarsh Video",
    stockMarket: "Stock Market"
  };

  subCategoryObj: Record<string, string[]> = {
    english: ["communication", "interviewPrep"],
    technical: ["angular", "react", "project", "linuxCommands", "gitCommands"],
    aiDevops: ["genAI", "aiPrompts", "owasp", "aws", "ciCd", "monitoring"],
    psychology: ["behavior", "intelligence", "communicationSkills", "mentalHealth", "relationships", "selfDevelopment"],
    health: ["eyes", "backBone", "ears", "teeth", "tests", "sugar", "outsideFood"],
    utkarshVideo: ["learningVideos", "games", "activities", "environment", "audioVideo", "tongueTest"],
    stockMarket: ["buyTwoOptions"]
  };

  valueObj: Record<string, any> = {
    communication: ["Writing (grammar, spelling)", "Speaking (confidence)", "Listening (understand native speakers)", "Technical vocabulary"],
    interviewPrep: ["Scenario-based questions", "HR questions", "AI mock interview"],
    angular: ["Angular Elements", "ngOnChanges", "Ivy engine", "Routing & Guards", "Signals", "Standalone components"],
    react: ["useState", "useReducer", "Props", "Context API", "Lazy loading", "Routing"],
    project: ["MEAN stack", "Architecture design", "Debugging"],
    linuxCommands: ["ls, cd, pwd", "chmod", "ps, kill"],
    gitCommands: ["clone, pull, push", "branch, merge"],
    genAI: ["AI concepts", "Time complexity", "Use cases"],
    aiPrompts: ["Prompt engineering", "Reusable prompts"],
    owasp: ["OWASP Top 10", "Security practices"],
    aws: ["S3", "Lambda", "IAM", "Cloud basics"],
    ciCd: ["Pipeline setup", "SonarQube", "Deployment flow"],
    monitoring: ["Logs", "Alerts", "Performance tracking"],
    behavior: ["Human behavior", "Child parenting"],
    intelligence: ["Emotional intelligence", "Cognitive skills"],
    communicationSkills: ["Verbal communication", "Social interaction"],
    mentalHealth: ["Stress management", "Mental wellness"],
    relationships: ["Relationship understanding", "Leadership"],
    selfDevelopment: ["Self awareness", "Personality growth"],
    eyes: "Eye checkup",
    backBone: "Backbone test",
    ears: "Ear care",
    teeth: "Brush twice",
    tests: ["Calcium", "Vitamin B12", "Vitamin D", "Cholesterol", "Sugar"],
    sugar: "Reduce sugar",
    outsideFood: "Avoid outside food",
    learningVideos: ["Jadu stories", "Wall videos", "Sound videos"],
    games: ["Mobile games", "Learning games"],
    activities: ["Story explain", "Music & story"],
    environment: ["Box with soil", "Fish tank", "Home setup"],
    audioVideo: ["Sound learning", "Video collection"],
    tongueTest: ["Reaction test", "Tongue test"],
    buyTwoOptions: "Buy two options per month"
  };

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
    return this.categoryObj[key];
  }
}
