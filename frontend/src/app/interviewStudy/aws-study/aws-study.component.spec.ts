import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsStudyComponent } from './aws-study.component';

describe('AwsStudyComponent', () => {
  let component: AwsStudyComponent;
  let fixture: ComponentFixture<AwsStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwsStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwsStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
