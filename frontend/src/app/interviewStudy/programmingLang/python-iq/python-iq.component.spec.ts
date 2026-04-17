import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PythonIQComponent } from './python-iq.component';

describe('PythonIQComponent', () => {
  let component: PythonIQComponent;
  let fixture: ComponentFixture<PythonIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PythonIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PythonIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
