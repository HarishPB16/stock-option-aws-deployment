import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IDEIQComponent } from './ideiq.component';

describe('IDEIQComponent', () => {
  let component: IDEIQComponent;
  let fixture: ComponentFixture<IDEIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IDEIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IDEIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
