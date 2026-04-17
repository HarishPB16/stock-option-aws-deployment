import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevOpsIQComponent } from './dev-ops-iq.component';

describe('DevOpsIQComponent', () => {
  let component: DevOpsIQComponent;
  let fixture: ComponentFixture<DevOpsIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevOpsIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevOpsIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
