import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PythonStudyComponent } from './python-study.component';

describe('PythonStudyComponent', () => {
  let component: PythonStudyComponent;
  let fixture: ComponentFixture<PythonStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PythonStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PythonStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
