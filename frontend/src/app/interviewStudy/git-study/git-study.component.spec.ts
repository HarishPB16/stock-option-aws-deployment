import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitStudyComponent } from './git-study.component';

describe('GitStudyComponent', () => {
  let component: GitStudyComponent;
  let fixture: ComponentFixture<GitStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
