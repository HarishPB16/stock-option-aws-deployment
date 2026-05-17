import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlStudyComponent } from './sql-study.component';

describe('SqlStudyComponent', () => {
  let component: SqlStudyComponent;
  let fixture: ComponentFixture<SqlStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
