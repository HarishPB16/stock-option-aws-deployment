import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptStudyComponent } from './prompt-study.component';

describe('PromptStudyComponent', () => {
  let component: PromptStudyComponent;
  let fixture: ComponentFixture<PromptStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
