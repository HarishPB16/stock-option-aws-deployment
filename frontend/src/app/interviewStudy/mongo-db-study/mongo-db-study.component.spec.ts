import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoDbStudyComponent } from './mongo-db-study.component';

describe('MongoDbStudyComponent', () => {
  let component: MongoDbStudyComponent;
  let fixture: ComponentFixture<MongoDbStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MongoDbStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongoDbStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
