import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactIQComponent } from './react-iq.component';

describe('ReactIQComponent', () => {
  let component: ReactIQComponent;
  let fixture: ComponentFixture<ReactIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
