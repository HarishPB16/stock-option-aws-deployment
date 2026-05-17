import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactStudyComponent } from './react-study.component';

describe('ReactStudyComponent', () => {
  let component: ReactStudyComponent;
  let fixture: ComponentFixture<ReactStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
