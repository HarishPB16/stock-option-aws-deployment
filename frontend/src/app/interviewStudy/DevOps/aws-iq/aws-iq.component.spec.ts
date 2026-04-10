import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwsIQComponent } from './aws-iq.component';

describe('AwsIQComponent', () => {
  let component: AwsIQComponent;
  let fixture: ComponentFixture<AwsIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwsIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwsIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
