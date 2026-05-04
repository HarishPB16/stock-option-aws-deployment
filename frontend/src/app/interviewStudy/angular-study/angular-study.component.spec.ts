import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularStudyComponent } from './angular-study.component';

describe('AngularStudyComponent', () => {
  let component: AngularStudyComponent;
  let fixture: ComponentFixture<AngularStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
