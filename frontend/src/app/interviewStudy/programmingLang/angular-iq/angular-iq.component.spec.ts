import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularIQComponent } from './angular-iq.component';

describe('AngularIQComponent', () => {
  let component: AngularIQComponent;
  let fixture: ComponentFixture<AngularIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
