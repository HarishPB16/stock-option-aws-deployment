import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeIQComponent } from './home-iq.component';

describe('HomeIQComponent', () => {
  let component: HomeIQComponent;
  let fixture: ComponentFixture<HomeIQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeIQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeIQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
